/* eslint-disable import/no-anonymous-default-export */

import OpenAI from 'openai';
import { handleOptions } from './preflight';
import { OpenAIStream } from 'ai';

export interface Env {
	OPENAI_API_KEY: string;
	PARLANO_CLOUDWORKER_SECRET: string;
	NEXT_PUBLIC_URL: string;
}

const corsHeaders = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': '*',
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		console.log('Incoming request', request);
		// Handle CORS preflight request
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// 1) Extract session and request body
		try {
			const body = await request.json();
			const { message, fileId, sessionId, token } = body as any;

			if (!sessionId || !token) {
				return new Response('Unauthorized', { status: 401 });
			}

			if (!message || !fileId) {
				return new Response('Invalid data', { status: 400 });
			}

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
