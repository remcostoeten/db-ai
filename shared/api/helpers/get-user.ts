import { authClient } from '../../../apps/web/src/core/utilities/auth-client';

export type TUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	role?: 'admin' | 'regular';
	lastSignInAt?: Date;
	createdAt: Date;
	updatedAt: Date;
};

export async function getUser(): Promise<TUser | null> {
	try {
		const { data } = await authClient.getSession();
		return data?.user as TUser || null;
	} catch (error) {
		console.error('Failed to get user:', error);
		return null;
	}
}
