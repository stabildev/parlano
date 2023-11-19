import { Unkey } from '@unkey/api';
import { Env } from '.';

export interface ValidateKeyParams {
	key: string;
	userId: string;
	env: Env;
}

export type ValidateKeyResult =
	| {
			success: true;
			error?: never;
	  }
	| {
			success: false;
			error: {
				message: string;
				code: 'UNAUTHORIZED' | 'UNKNOWN_ERROR';
			};
	  };

export const validateKey = async ({ key, userId, env }: ValidateKeyParams): Promise<ValidateKeyResult> => {
	const apiId = env.UNKEY_API_ID;
	const token = env.UNKEY_TOKEN;
	const unkey = new Unkey({ token, retry: { attempts: 5 } });

	if (!userId || !key) {
		throw new Error('Missing userId or key');
	}

	// Validate key
	const result = await unkey.keys.verify({
		apiId,
		key,
	});

	if (!result.result) {
		console.error('Could not verify key', JSON.stringify(result.error));
		return {
			success: false,
			error: {
				message: 'Could not verify key',
				code: 'UNKNOWN_ERROR',
			},
		};
	}

	const keyData = result.result;

	if (!keyData.valid || keyData.ownerId !== userId) {
		console.error('Key is not valid', JSON.stringify(result.error));
		return {
			success: false,
			error: {
				message: 'Key is not valid',
				code: 'UNAUTHORIZED',
			},
		};
	}

	return {
		success: true,
	};
};
