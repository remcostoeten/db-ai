import { authClient } from '../../../apps/web/src/core/utilities/auth-client';
import { getUser, type TUser } from './get-user';

type TAuthState = {
	isAuthenticated: boolean;
	isAdmin: boolean;
	user: TUser | null;
	isLoading: boolean;
};

export async function getAuthState(): Promise<TAuthState> {
	try {
		const user = await getUser();

		return {
			isAuthenticated: !!user,
			isAdmin: user?.role === 'admin',
			user,
			isLoading: false,
		};
	} catch (error) {
		console.error('Failed to get auth state:', error);
		return {
			isAuthenticated: false,
			isAdmin: false,
			user: null,
			isLoading: false,
		};
	}
}

export async function signOut(): Promise<boolean> {
	try {
		await authClient.signOut();
		return true;
	} catch (error) {
		console.error('Failed to sign out:', error);
		return false;
	}
}

export async function refreshSession(): Promise<boolean> {
	try {
		const { data } = await authClient.getSession();
		return !!data?.session;
	} catch (error) {
		console.error('Failed to refresh session:', error);
		return false;
	}
}
