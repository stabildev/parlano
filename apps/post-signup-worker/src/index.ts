/* eslint-disable import/no-anonymous-default-export */
import { Unkey } from '@unkey/api';
import { Webhook } from 'svix';
import Clerk from '@clerk/clerk-sdk-node/esm/instance';
import type { UserWebhookEvent } from '@clerk/clerk-sdk-node';

export interface Env {
	UNKEY_TOKEN: string;
	UNKEY_API_ID: string;
	CLERK_POST_SIGNUP_SECRET: string;
	CLERK_SECRET_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// VERIFY REQUEST

		// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
		const WEBHOOK_SECRET = env.CLERK_POST_SIGNUP_SECRET;

		if (!WEBHOOK_SECRET) {
			throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
		}

		// Get the headers
		const headerPayload = request.headers;
		const svix_id = headerPayload.get('svix-id');
		const svix_timestamp = headerPayload.get('svix-timestamp');
		const svix_signature = headerPayload.get('svix-signature');

		// If there are no headers, error out
		if (!svix_id || !svix_timestamp || !svix_signature) {
			return new Response('Error occured -- no svix headers', {
				status: 400,
			});
		}

		// Get the body
		const payload = await request.json();
		const body = JSON.stringify(payload);

		// Create a new Svix instance with your secret.
		const wh = new Webhook(WEBHOOK_SECRET);

		let evt: UserWebhookEvent;

		// Verify the payload with the headers
		try {
			evt = wh.verify(body, {
				'svix-id': svix_id,
				'svix-timestamp': svix_timestamp,
				'svix-signature': svix_signature,
			}) as UserWebhookEvent;
		} catch (err) {
			console.error('Error verifying webhook:', err);
			return new Response('Error occured', {
				status: 400,
			});
		}

		// Get the ID and type
		const { id } = evt.data;
		const eventType = evt.type;

		console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
		console.log('Webhook body:', body);

		// CREATE OR UPDATE API KEY

		const unkey = new Unkey({
			token: env.UNKEY_TOKEN,
			retry: { attempts: 5 },
		});

		// We only care about user.created and user.updated events
		if (eventType !== 'user.created' && eventType !== 'user.updated') {
			return new Response('Success', { status: 200 });
		}

		// The key that will be synced with Clerk
		let meta: Record<string, string> | undefined;

		if (eventType === 'user.created') {
			// Create an API key for the new user for the free plan

			const key = await unkey.keys.create({
				apiId: env.UNKEY_API_ID,
				ownerId: id,
				meta: {
					plan: 'free',
				},
				prefix: 'parlano_',
				ratelimit: {
					limit: 50,
					refillInterval: 60 * 60 * 1000,
					refillRate: 50,
					type: 'consistent',
				},
			});

			if (key.error || !key.result.key) {
				console.error('Error creating key', key.error);
				return new Response('Error occured', {
					status: 500,
				});
			}

			meta = {
				parlanoKey: key.result.key,
			};
		} else {
			// eventType === 'user.updated'
			// Check if user is on pro plan and still has time left
			const { stripeCurrentPeriodEnd } = evt.data.private_metadata as {
				stripeCurrentPeriodEnd?: string;
			};

			// If the user is not on pro plan or pro plan has expired, do nothing
			// This is handled automatically by Unkey via expiring API keys
			if (!stripeCurrentPeriodEnd || new Date(stripeCurrentPeriodEnd).getTime() <= Date.now()) {
				return new Response('Success', { status: 200 });
			}

			// User is on pro plan and still has time left
			// Create a new API key for pro plan if it doesn't exist yet

			// Check if the user already has a pro plan key
			const keys = await unkey.apis.listKeys({
				apiId: env.UNKEY_API_ID,
				ownerId: id,
			});

			if (keys.error) {
				console.error('Error getting keys', keys.error);
				return new Response('Error occured', {
					status: 500,
				});
			}

			const proKey = keys.result.keys.find(
				(key) => key.meta && typeof key.meta === 'object' && 'plan' in key.meta && key.meta.plan === 'pro',
			);

			// If the user already has a pro plan key, do nothing
			if (proKey) {
				return new Response('Success', { status: 200 });
			}

			// Otherwise create a new pro plan key

			const key = await unkey.keys.create({
				apiId: env.UNKEY_API_ID,
				ownerId: id,
				meta: {
					plan: 'pro',
				},
				expires: new Date(stripeCurrentPeriodEnd).getTime(),
				prefix: 'parlano_',
				ratelimit: {
					limit: 50,
					refillInterval: 60 * 60 * 1000,
					refillRate: 50,
					type: 'consistent',
				},
			});

			if (key.error || !key.result.key) {
				console.error('Error creating key', key.error);
				return new Response('Error occured', {
					status: 500,
				});
			}

			meta = {
				...evt.data.public_metadata,
				parlanoProKey: key.result.key,
			};
		}

		// Update the user's metadata with the key
		const clerkClient = Clerk({
			secretKey: env.CLERK_SECRET_KEY!,
		});

		const result = await clerkClient.users
			.updateUserMetadata(id!, {
				publicMetadata: meta,
			})
			.catch((err) => {
				console.error('Error updating user metadata', err);
				return null;
			});

		console.log('Updated user metadata', result);

		if (result?.publicMetadata !== meta) {
			console.error('Error updating user metadata', result);
			return new Response('Error occured', {
				status: 500,
			});
		}

		return new Response('Success', { status: 200 });
	},
};
