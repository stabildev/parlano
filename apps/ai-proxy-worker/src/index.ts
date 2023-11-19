/* eslint-disable import/no-anonymous-default-export */

import OpenAI from 'openai';
import { handleOptions } from './preflight';
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

const corsHeaders = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': '*',
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight request
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// 1) Extract session and request body
		try {
			const body = await request.json();
			console.log('body', body);
			// sessionId and token come from Clerk
			const { message, fileId, sessionId, token, userId, userKey, proKey } = body as {
				message?: string;
				fileId?: string;
				sessionId?: string;
				token?: string;
				userId?: string;
				userKey?: string;
				proKey?: string;
			};

			if (!sessionId || !token || !userId || !userKey) {
				return new Response('Unauthorized', { status: 401 });
			}

			if (!message || !fileId) {
				return new Response('Invalid data', { status: 400 });
			}

			// check if api key is valid
			const keyValid = await validateKey({
				key: proKey ?? userKey,
				userId,
				env,
			});

			// handle invalid unkey
			if (!keyValid.success) {
				switch (keyValid.error.code) {
					case 'UNAUTHORIZED':
						// If only the free key was supplied, we can't do anything
						if (!proKey) {
							return new Response('Unauthorized', { status: 401 });
						}

						// If a pro key has expired, we need to switch the user back to free plan

						// Remove expired pro key from clerk metadata
						const clerkClient = Clerk({
							secretKey: env.CLERK_SECRET_KEY!,
						});

						console.log('Clerk userId', userId);

						const user = await clerkClient.users.getUser(userId).catch((err) => {
							console.error('Error getting user', err);
							return null;
						});

						console.log('Clerk user', user);

						if (!user) {
							return new Response('Unauthorized', { status: 401 });
						}

						const { publicMetadata } = user;
						publicMetadata.parlanoProKey = null;
						console.log('Clerk publicMetadata', publicMetadata);

						// Don't await this, we don't want to further block the request
						const user2 = await clerkClient.users
							.updateUserMetadata(userId, {
								publicMetadata,
							})
							.catch((err) => {
								console.error('Error updating user metadata', err);
								return null;
							});

						console.log('Clerk updated user metadata', user2);

						// Check if free key is valid for this request
						const freeKeyValid = await validateKey({
							key: userKey,
							userId,
							env,
						});

						// If the free key is invalid, we can't do anything
						if (!freeKeyValid.success) {
							return new Response('Unauthorized', { status: 401 });
						}

						break;
					default:
						return new Response('Internal server error', { status: 500 });
				}
			}

			// at this point we know the key is valid and the user is authorized to access openai

			const headers = {
				Authorization: `Bearer ${env.PARLANO_CLOUDWORKER_SECRET}`,
				'Content-Type': 'application/json',
			};

			// Request prompt from backend
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
				return new Response('Request failed', { status: response.status });
			}

			// 2) Extract prompt messages from response
			try {
				const data = (await response.json()) as any;
				const { messages } = data;

				// 3) OpenAI request
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
			} catch (error) {
				console.error(error);
				return new Response('Internal server error', { status: 500, headers: corsHeaders });
			}
		} catch (error) {
			return new Response('Bad request', { status: 400 });
		}
	},
};
