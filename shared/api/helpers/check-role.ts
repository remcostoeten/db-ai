import { getUser } from './get-user';



type TCheckRoleOptions = {
	admin?: boolean;
	regular?: boolean;
};

export async function checkRole(options: TCheckRoleOptions): Promise<boolean> {
	try {
		const user = await getUser();

		if (!user || !user.role) {
			return false;
		}

		if (options.admin && user.role === 'admin') {
			return true;
		}

		if (options.regular && user.role === 'regular') {
			return true;
		}

		return false;
	} catch (error) {
		console.error('Failed to check user role:', error);
		return false;
	}
}

export async function requireAdmin(): Promise<boolean> {
	const hasAdminRole = await checkRole({ admin: true });

	if (!hasAdminRole) {
		throw new Error('Admin access required');
	}

	return true;
}

export async function isAdmin(): Promise<boolean> {
	return await checkRole({ admin: true });
}

export async function isRegularUser(): Promise<boolean> {
	return await checkRole({ regular: true });
}
