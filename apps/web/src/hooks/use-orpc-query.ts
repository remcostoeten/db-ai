import { createResource, type Resource } from 'solid-js';
import { client } from '@/utils/orpc';

type TApiCall<T> = () => Promise<T>;

/**
 * Reusable hook for ORPC queries with proper typing and error handling
 */
export function useOrpcQuery<T>(
	queryFn: TApiCall<T>,
	options?: {
		onError?: (error: Error) => void;
	}
) {
	const [data, { mutate, refetch }] = createResource(async () => {
		try {
			return await queryFn();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('ORPC Query Error:', errorMessage);
			
			if (options?.onError) {
				options.onError(error instanceof Error ? error : new Error(errorMessage));
			}
			
			throw error;
		}
	});

	return [data, { mutate, refetch }];
}

/**
 * Typed ORPC client queries - eliminates need for type assertions
 */
export const queries = {
	// Connection queries
	connections: {
		getAll: () => client.connection.getAll() as Promise<import('@/types/connection').TConnection[]>,
		getById: (id: string) => client.connection.getById({ id }) as Promise<import('@/types/connection').TConnection>,
	},
	
	// Todo queries  
	todos: {
		getAll: () => client.todo.getAll() as Promise<import('@/types/todo').TTodo[]>,
	},
	
	// Admin queries
	admin: {
		getDashboardStats: () => client.admin.getDashboardStats(),
		getUserCount: (params: { role?: 'admin' | 'regular' } = {}) => client.admin.getUserCount(params),
		getAllUsers: (params: { page?: number; limit?: number; search?: string; role?: 'admin' | 'regular' } = {}) => client.admin.getAllUsers(params),
	},
	
	// User queries
	user: {
		getRole: () => client.user.getRole(),
	},
	
	// Health check
	healthCheck: () => client.healthCheck(),
} as const;