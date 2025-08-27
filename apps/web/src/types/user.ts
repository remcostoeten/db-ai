export type TUserFilters = {
	sort: 'asc' | 'desc' | 'loginasc' | 'logindesc';
	roles: 'all' | 'admin' | 'regular';
	search?: string;
	limit: number;
	offset: number;
};

export type TUser = {
	id: string;
	email: string;
	name?: string | null;
	role?: string | null;
	emailVerified: boolean;
	lastSignInAt?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type TDashboardStats = {
	totalUsers: number;
	adminUsers: number;
	regularUsers: number;
	activeSessions: number;
};
