import { createAuthClient } from 'better-auth/solid';
import { getAuthBaseURL, isTauri } from './platform';

function getTauriAuthConfig() {
	return {
		fetchOptions: {
			credentials: 'include' as const,
			mode: 'cors' as const,
		},
		headers: {
			'Content-Type': 'application/json',
			'X-Client-Platform': 'tauri',
		},
	};
}

function getBrowserAuthConfig() {
	return {
		fetchOptions: {
			credentials: 'include' as const,
		},
		headers: {
			'Content-Type': 'application/json',
			'X-Client-Platform': 'browser',
		},
	};
}

export const authClient = createAuthClient({
	baseURL: getAuthBaseURL(),
	...(isTauri() ? getTauriAuthConfig() : getBrowserAuthConfig()),
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
