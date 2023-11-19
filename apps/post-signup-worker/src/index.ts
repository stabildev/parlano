/* eslint-disable import/no-anonymous-default-export */
import { type UserWebhookEvent } from '@clerk/clerk-sdk-node';
import Clerk from '@clerk/clerk-sdk-node/esm/instance';
import { Unkey } from '@unkey/api';
import { Webhook } from 'svix';

export interface Env {
	UNKEY_TOKEN: string;
	UNKEY_API_ID: string;
	CLERK_POST_SIGNUP_SECRET: string;
	CLERK_SECRET_KEY: string;
}

/**
 * This worker is triggered by a webhook from Clerk when a user is created or updated.
 * When a user is created, a free plan API key is created in Unkey and added to the user's metadata in Clerk.
 * When a user is upgraded to pro plan, a pro plan API key is created in Unkey and added to the user's metadata in Clerk.
 * This webhook does not handle downgrades or cancellations. This is handled automatically by Unkey via expiring API keys.
 * Expired keys are removed from the user's metadata when trying to use them in ai-proxy-worker.
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Verify that the request is coming from Clerk
		const WEBHOOK_SECRET = env.CLERK_POST_SIGNUP_SECRET;

		if (!WEBHOOK_SECRET) {
			throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
		}

		const svix_id = request.headers.get('svix-id');
		const svix_timestamp = request.headers.get('svix-timestamp');
		const svix_signature = request.headers.get('svix-signature');

		if (!svix_id || !svix_timestamp || !svix_signature) {
			return new Response('Error occured -- no svix headers', {
				status: 400,
			});
		}

		const body = await request.text();

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

		const unkey = new Unkey({
			token: env.UNKEY_TOKEN,
			retry: { attempts: 5 },
		});

		const clerkClient = Clerk({
			secretKey: env.CLERK_SECRET_KEY!,
		});

		switch (evt.type) {
			// Create new free plan API key in Unkey on user creation
			case 'user.created': {
				const { id: userId, public_metadata: publicMetadata } = evt.data;

				const key = await unkey.keys.create({
					apiId: env.UNKEY_API_ID,
					ownerId: userId,
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

				// Add the free plan key to the user's metadata in Clerk
				const updatedUser = await clerkClient.users
					.updateUserMetadata(userId!, {
						publicMetadata: {
							...publicMetadata,
							freePlanKey: key.result.key,
						},
					})
					.catch((err) => {
						console.error('Error updating user metadata', err);
						return null;
					});

				// Verify that the metadata was updated
				if (updatedUser?.publicMetadata.freePlanKey !== key.result.key) {
					console.error('Error updating user metadata');
					return new Response('Error occured', {
						status: 500,
					});
				}

				return new Response('Success', { status: 200 });
			}

			// Create new pro plan API key in Unkey on user upgrade
			case 'user.updated': {
				const { id: userId, public_metadata: publicMetadata } = evt.data;

				// Check if user is on pro plan and still has time left
				const { stripeCurrentPeriodEnd } = publicMetadata as { stripeCurrentPeriodEnd?: string };

				// If the user is not on pro plan or pro plan has expired, do nothing
				// This is handled automatically by Unkey via expiring API keys
				// The expired key - if it exists - will be removed from the user's metadata in ai-proxy-worker
				if (!stripeCurrentPeriodEnd || new Date(stripeCurrentPeriodEnd).getTime() <= Date.now()) {
					return new Response('Success', { status: 200 });
				}

				// Check if the user already has a pro plan key. If so, do nothing
				const keys = await unkey.apis.listKeys({
					apiId: env.UNKEY_API_ID,
					ownerId: userId,
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

				if (proKey) {
					return new Response('Success', { status: 200 });
				}

				// Create a new pro plan key and add it to the user's metadata in Clerk
				const key = await unkey.keys.create({
					apiId: env.UNKEY_API_ID,
					ownerId: userId,
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

				const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
					publicMetadata: {
						...publicMetadata,
						proPlanKey: key.result.key,
					},
				});

				if (updatedUser?.publicMetadata.proPlanKey !== key.result.key) {
					console.error('Error updating user metadata');
					return new Response('Error occured', {
						status: 500,
					});
				}

				return new Response('Success', { status: 200 });
			}

			default: {
				return new Response('Success', { status: 200 });
			}
		}
	},
};
