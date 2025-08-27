import { orpc } from "@/utils/orpc";
import type { QueryOptions, MutationOptions } from "@tanstack/solid-query";
import { createMemo } from "solid-js";

/**
 * Enhanced query hook with better error handling and loading states
 */
export function useORPCQuery<TData, TError = Error>(
	queryFn: () => QueryOptions<TData, TError>,
	options?: {
		enabled?: boolean;
		refetchOnWindowFocus?: boolean;
		staleTime?: number;
	}
) {
	const query = orpc.useQuery(() => ({
		...queryFn(),
		enabled: options?.enabled ?? true,
		refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
		staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
	}));

	const state = createMemo(() => ({
		data: query.data,
		error: query.error,
		isLoading: query.isLoading,
		isPending: query.isPending,
		isError: query.isError,
		isSuccess: query.isSuccess,
		refetch: query.refetch,
	}));

	return state;
}

/**
 * Enhanced mutation hook with better error handling and optimistic updates
 */
export function useORPCMutation<TData, TVariables, TError = Error>(
	mutationFn: () => MutationOptions<TData, TError, TVariables>,
	options?: {
		onSuccess?: (data: TData, variables: TVariables) => void;
		onError?: (error: TError, variables: TVariables) => void;
		onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
	}
) {
	const mutation = orpc.useMutation(() => ({
		...mutationFn(),
		onSuccess: options?.onSuccess,
		onError: options?.onError,
		onSettled: options?.onSettled,
	}));

	const state = createMemo(() => ({
		mutate: mutation.mutate,
		mutateAsync: mutation.mutateAsync,
		data: mutation.data,
		error: mutation.error,
		isLoading: mutation.isPending,
		isPending: mutation.isPending,
		isError: mutation.isError,
		isSuccess: mutation.isSuccess,
		reset: mutation.reset,
	}));

	return state;
}

/**
 * Utility for creating optimistic updates
 */
export function createOptimisticUpdate<T>(
	queryKey: string[],
	updateFn: (oldData: T, newData: Partial<T>) => T
) {
	return {
		onMutate: async (newData: Partial<T>) => {
			// Cancel outgoing refetches
			await orpc.queryClient.cancelQueries({ queryKey });

			// Snapshot previous value
			const previousData = orpc.queryClient.getQueryData<T>(queryKey);

			// Optimistically update
			if (previousData) {
				orpc.queryClient.setQueryData(queryKey, updateFn(previousData, newData));
			}

			return { previousData };
		},
		onError: (err: any, newData: Partial<T>, context: any) => {
			// Rollback on error
			if (context?.previousData) {
				orpc.queryClient.setQueryData(queryKey, context.previousData);
			}
		},
		onSettled: () => {
			// Refetch after mutation
			orpc.queryClient.invalidateQueries({ queryKey });
		},
	};
}

/**
 * Hook for managing form state with oRPC mutations
 */
export function useORPCForm<TFormData, TResponse>(
	mutationFn: () => MutationOptions<TResponse, Error, TFormData>,
	options?: {
		onSuccess?: (data: TResponse) => void;
		resetOnSuccess?: boolean;
		optimisticUpdate?: ReturnType<typeof createOptimisticUpdate>;
	}
) {
	const mutation = useORPCMutation(mutationFn, {
		...options?.optimisticUpdate,
		onSuccess: (data, variables) => {
			options?.onSuccess?.(data);
			options?.optimisticUpdate?.onSettled?.();
		},
	});

	return {
		...mutation,
		handleSubmit: (formData: TFormData) => {
			mutation.mutate(formData);
		},
	};
}