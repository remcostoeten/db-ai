import { orpc } from "@/utils/orpc";
import { createMemo } from "solid-js";

/**
 * Enhanced hooks for better DX with oRPC
 */

// Connection hooks
export function useConnections() {
	const query = orpc.connection.getAll.useQuery();
	
	return createMemo(() => ({
		...query,
		connections: query.data || [],
		activeConnections: query.data?.filter(conn => conn.isActive === "true") || [],
		totalConnections: query.data?.length || 0,
		isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
	}));
}

export function useConnection(id: string) {
	const query = orpc.connection.getById.useQuery(() => ({ id }), {
		enabled: !!id,
	});
	
	return createMemo(() => ({
		...query,
		connection: query.data,
	}));
}

export function useCreateConnection() {
	const mutation = orpc.connection.create.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["connection", "getAll"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		createConnection: mutation.mutate,
		createConnectionAsync: mutation.mutateAsync,
	}));
}

export function useUpdateConnection() {
	const mutation = orpc.connection.update.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["connection"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		updateConnection: mutation.mutate,
		updateConnectionAsync: mutation.mutateAsync,
	}));
}

export function useDeleteConnection() {
	const mutation = orpc.connection.delete.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["connection", "getAll"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		deleteConnection: mutation.mutate,
		deleteConnectionAsync: mutation.mutateAsync,
	}));
}

export function useTestConnection() {
	const mutation = orpc.connection.testConnection.useMutation();
	
	return createMemo(() => ({
		...mutation,
		testConnection: mutation.mutate,
		testConnectionAsync: mutation.mutateAsync,
	}));
}

export function useToggleConnectionActive() {
	const mutation = orpc.connection.toggleActive.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["connection", "getAll"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		toggleActive: mutation.mutate,
		toggleActiveAsync: mutation.mutateAsync,
	}));
}

// Database hooks
export function useDatabases(connectionId: string) {
	const query = orpc.database.getByConnectionId.useQuery(
		() => ({ connectionId }),
		{ enabled: !!connectionId }
	);
	
	return createMemo(() => ({
		...query,
		databases: query.data || [],
		isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
	}));
}

export function useSyncDatabases() {
	const mutation = orpc.database.syncFromConnection.useMutation({
		onSuccess: (_, variables) => {
			orpc.queryClient.invalidateQueries({ 
				queryKey: ["database", "getByConnectionId", variables.connectionId] 
			});
		},
	});
	
	return createMemo(() => ({
		...mutation,
		syncDatabases: mutation.mutate,
		syncDatabasesAsync: mutation.mutateAsync,
	}));
}

// Table hooks
export function useTables(databaseId: string) {
	const query = orpc.table.getByDatabaseId.useQuery(
		() => ({ databaseId }),
		{ enabled: !!databaseId }
	);
	
	return createMemo(() => ({
		...query,
		tables: query.data || [],
		isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
	}));
}

export function useSyncTables() {
	const mutation = orpc.table.syncFromDatabase.useMutation({
		onSuccess: (_, variables) => {
			orpc.queryClient.invalidateQueries({ 
				queryKey: ["table", "getByDatabaseId", variables.databaseId] 
			});
		},
	});
	
	return createMemo(() => ({
		...mutation,
		syncTables: mutation.mutate,
		syncTablesAsync: mutation.mutateAsync,
	}));
}

// Column hooks
export function useColumns(tableId: string) {
	const query = orpc.column.getByTableId.useQuery(
		() => ({ tableId }),
		{ enabled: !!tableId }
	);
	
	return createMemo(() => ({
		...query,
		columns: query.data || [],
		primaryKeys: query.data?.filter(col => col.isPrimaryKey === "true") || [],
		foreignKeys: query.data?.filter(col => col.isForeignKey === "true") || [],
		isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
	}));
}

export function useSyncColumns() {
	const mutation = orpc.column.syncFromTable.useMutation({
		onSuccess: (_, variables) => {
			orpc.queryClient.invalidateQueries({ 
				queryKey: ["column", "getByTableId", variables.tableId] 
			});
		},
	});
	
	return createMemo(() => ({
		...mutation,
		syncColumns: mutation.mutate,
		syncColumnsAsync: mutation.mutateAsync,
	}));
}

// Todo hooks
export function useTodos() {
	const query = orpc.todo.getAll.useQuery();
	
	return createMemo(() => ({
		...query,
		todos: query.data || [],
		completedTodos: query.data?.filter(todo => todo.completed) || [],
		pendingTodos: query.data?.filter(todo => !todo.completed) || [],
		totalTodos: query.data?.length || 0,
		isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
	}));
}

export function useCreateTodo() {
	const mutation = orpc.todo.create.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["todo", "getAll"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		createTodo: mutation.mutate,
		createTodoAsync: mutation.mutateAsync,
	}));
}

export function useUpdateTodo() {
	const mutation = orpc.todo.update.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["todo"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		updateTodo: mutation.mutate,
		updateTodoAsync: mutation.mutateAsync,
	}));
}

export function useToggleTodo() {
	const mutation = orpc.todo.toggle.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["todo", "getAll"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		toggleTodo: mutation.mutate,
		toggleTodoAsync: mutation.mutateAsync,
	}));
}

export function useDeleteTodo() {
	const mutation = orpc.todo.delete.useMutation({
		onSuccess: () => {
			orpc.queryClient.invalidateQueries({ queryKey: ["todo", "getAll"] });
		},
	});
	
	return createMemo(() => ({
		...mutation,
		deleteTodo: mutation.mutate,
		deleteTodoAsync: mutation.mutateAsync,
	}));
}

// Health check hook
export function useHealthCheck() {
	const query = orpc.healthCheck.useQuery();
	
	return createMemo(() => ({
		...query,
		isHealthy: query.data === "OK",
	}));
}

// Private data hook (example)
export function usePrivateData() {
	try {
		const query = orpc.privateData.useQuery();
		
		return createMemo(() => ({
			...query,
			privateData: query.data,
		}));
	} catch (error) {
		console.error('Error in usePrivateData:', error);
		return createMemo(() => ({
			data: undefined,
			isLoading: false,
			isError: true,
			error,
			privateData: undefined,
		}));
	}
}