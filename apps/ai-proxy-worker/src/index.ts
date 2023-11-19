/* eslint-disable import/no-anonymous-default-export */

import OpenAI from 'openai';
import { corsHeaders, handleOptions } from './cors';
import { OpenAIStream } from 'ai';
import { validateKey } from './unkey';
import Clerk from '@clerk/clerk-sdk-node/esm/instance';

export interface Env {
	OPENAI_API_KEY: string;
	PARLANO_CLOUDWORKER_SECRET: string;
	NEXT_PUBLIC_URL: string;
	UNKEY_TOKEN: string;
	UNKEY_API_ID: string;
	CLERK_SECRET_KEY: string;
}

/**
 * Called from the frontend to fetch a prompt from the backend and then send it to OpenAI.
 * Needs CORS headers to allow requests from the frontend.
 * Clerk session and token are required to authenticate the request in the Nextjs backend.
 * Either a free or pro plan key is required to authenticate the request.
 * Expired pro plan keys are automatically removed from the user's metadata in Clerk.
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight request
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// 1) Extract session and request body
		const body = await request.json().catch((err) => {
			console.error('Error parsing request body', err);
			return null;
		});

		if (!body) {
			return new Response('Bad request', { status: 400, headers: corsHeaders });
		}

		const { message, fileId, sessionId, token, userId, freePlanKey, proPlanKey } = body as {
			message?: string;
			fileId?: string;
			sessionId?: string;
			token?: string;
			userId?: string;
			freePlanKey?: string;
			proPlanKey?: string;
		};

		if (!sessionId || !token || !userId || (!freePlanKey && !proPlanKey)) {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}

		if (!message || !fileId) {
			return new Response('Invalid data', { status: 400, headers: corsHeaders });
		}

		// check if api key is valid
		// Prefer pro key if it exists, otherwise fall back to free key

		let isAuthorized = false;
		for (const key of [proPlanKey, freePlanKey]) {
			if (!key) {
				continue;
			}

			const keyValid = await validateKey({
				key,
				userId,
				env,
			});

			if (keyValid.success) {
				isAuthorized = true;
				break;
			}

			// Remove expired pro key from clerk metadata
			if (key === proPlanKey) {
				const clerkClient = Clerk({
					secretKey: env.CLERK_SECRET_KEY!,
				});

				const user = await clerkClient.users.getUser(userId).catch((err) => {
					console.error('Error getting user', err);
					return null;
				});

				if (!user) {
					return new Response('Unauthorized', { status: 401, headers: corsHeaders });
				}

				const { publicMetadata } = user;

				await clerkClient.users
					.updateUserMetadata(userId, {
						publicMetadata: {
							...publicMetadata,
							parlanoProKey: null,
						},
					})
					.catch((err) => {
						console.error('Error updating user metadata', err);
						return null;
					});
			}
		}

		// If no valid key was found, return unauthorized
		if (!isAuthorized) {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}

		// Get prompt from Nextjs backend
		const headers = {
			Authorization: `Bearer ${env.PARLANO_CLOUDWORKER_SECRET}`,
			'Content-Type': 'application/json',
		};

		const response = await fetch(`${env.NEXT_PUBLIC_URL}/api/message`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				message,
				fileId,
				sessionId,
				token,
			}),
		});

		if (!response.ok) {
			return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
		}

		const promptData = await response.json().catch((err) => {
			console.error('Error parsing prompt data', err);
			return null;
		});

		if (!promptData) {
			return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
		}

		const { messages } = promptData as any;

		// OpenAI request
		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
		});

		const openAIResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			temperature: 0,
			stream: true,
			messages,
		});

		const stream = OpenAIStream(openAIResponse, {
			onCompletion: async (completion: string) => {
				// After stream ends, send complete message to backend to save in db
				await fetch(`${env.NEXT_PUBLIC_URL}/api/post-stream`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						message: completion,
						fileId,
						sessionId,
						token,
					}),
				});
			},
		});

		// 4) Stream to client
		return new Response(stream, { headers: corsHeaders });
	},
};
