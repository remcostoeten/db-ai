import { getAuthState } from './auth-state';
import { requireAdmin } from './check-role';

export async function requireAuthentication(): Promise<boolean> {
	const authState = await getAuthState();

	if (!authState.isAuthenticated) {
		throw new Error('Authentication required');
	}

	return true;
}

export async function requireAdminAccess(): Promise<boolean> {
	await requireAuthentication();
	await requireAdmin();
	return true;
}

export function createRouteGuard(requiresAdmin = false) {
	return async function guardRoute() {
		if (requiresAdmin) {
			return await requireAdminAccess();
		}
		return await requireAuthentication();
	};
}

export const adminGuard = createRouteGuard(true);
export const authGuard = createRouteGuard(false);
