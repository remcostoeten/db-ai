import { createSignal } from 'solid-js';
import { client } from '@/utils/orpc';

type TMutationFn<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * Reusable hook for ORPC mutations with loading states and error handling
 */
export function useOrpcMutation<TInput, TOutput>(
	mutationFn: TMutationFn<TInput, TOutput>,
	options?: {
		onSuccess?: (data: TOutput, variables: TInput) => void | Promise<void>;
		onError?: (error: Error, variables: TInput) => void;
	}
) {
	const [isLoading, setIsLoading] = createSignal(false);
	const [error, setError] = createSignal<Error | null>(null);

	const mutate = async (variables: TInput): Promise<TOutput | undefined> => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await mutationFn(variables);
			
			if (options?.onSuccess) {
				await options.onSuccess(result, variables);
			}
			
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Unknown error');
			setError(error);
			
			if (options?.onError) {
				options.onError(error, variables);
			}
			
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		mutate,
		isLoading,
		error,
	};
}

/**
 * Typed ORPC client mutations - eliminates need for type assertions
 */
export const mutations = {
	// Connection mutations
	connections: {
		create: (data: Omit<import('@/types/connection').TConnection, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => 
			client.connection.create(data) as Promise<import('@/types/connection').TConnection>,
		update: (data: { id: string } & Partial<Omit<import('@/types/connection').TConnection, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>>) => 
			client.connection.update(data) as Promise<import('@/types/connection').TConnection>,
		delete: (data: { id: string }) => 
			client.connection.delete(data) as Promise<import('@/types/connection').TConnection>,
	},
	
	// Todo mutations
	todos: {
		create: (data: { text: string }) => 
			client.todo.create(data) as Promise<import('@/types/todo').TTodo>,
		toggle: (data: { id: number; completed: boolean }) => 
			client.todo.toggle(data) as Promise<import('@/types/todo').TTodo>,
		delete: (data: { id: number }) => 
			client.todo.delete(data) as Promise<import('@/types/todo').TTodo>,
	},
	
	// Admin mutations
	admin: {
		updateUserRole: (data: { userId: string; role: 'admin' | 'regular' }) => 
			client.admin.updateUserRole(data),
	},
} as const;