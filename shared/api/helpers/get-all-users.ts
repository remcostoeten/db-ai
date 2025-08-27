import { client } from '../../apps/web/src/utils/orpc';

type TUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	role: 'admin' | 'regular';
	lastSignInAt?: Date;
	createdAt: Date;
	updatedAt: Date;
};

type TSortOption = 'asc' | 'desc' | 'loginasc' | 'logindesc';

type TGetAllUsersOptions = {
	sort?: TSortOption;
	roles?: 'all' | 'admin' | 'regular';
	search?: string;
	limit?: number;
	offset?: number;
};

export async function getAllUsers(
	options: TGetAllUsersOptions = {}
): Promise<TUser[]> {
	try {
		const { sort = 'asc', roles = 'all', search, limit, offset } = options;

		const result = await client.admin.getAllUsers({
			sort,
			roles,
			search,
			limit,
			offset,
		});

		return result;
	} catch (error) {
		console.error('Failed to get all users:', error);
		throw new Error('Failed to fetch users');
	}
}

export async function getUserCount(
	role?: 'admin' | 'regular'
): Promise<number> {
	try {
		const result = await client.admin.getUserCount({ role });
		return result;
	} catch (error) {
		console.error('Failed to get user count:', error);
		return 0;
	}
}

export async function updateUserRole(
	userId: string,
	role: 'admin' | 'regular'
): Promise<boolean> {
	try {
		await client.admin.updateUserRole({ userId, role });
		return true;
	} catch (error) {
		console.error('Failed to update user role:', error);
		return false;
	}
}
