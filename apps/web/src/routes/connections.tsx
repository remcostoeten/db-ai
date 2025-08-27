import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import { Plus, Database, Settings, Trash2, TestTube, Eye, EyeOff, Loader2 } from "lucide-solid";
import { useAuthGuard } from "@/lib/route-guards";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { 
	useConnections, 
	useCreateConnection, 
	useUpdateConnection, 
	useDeleteConnection, 
	useTestConnection, 
	useToggleConnectionActive 
} from "@/lib/orpc-hooks";

export const Route = createFileRoute("/connections")({
	component: ConnectionsRoute,
});

function ConnectionsRoute() {
	const navigate = Route.useNavigate();
	const session = useAuthGuard(navigate);
	const [showCreateForm, setShowCreateForm] = createSignal(false);
	const [editingConnection, setEditingConnection] = createSignal<string | null>(null);

	// Use standardized hooks
	const connections = useConnections();
	const createConnection = useCreateConnection();
	const updateConnection = useUpdateConnection();
	const deleteConnection = useDeleteConnection();
	const testConnection = useTestConnection();
	const toggleConnectionActive = useToggleConnectionActive();

	// Show loading state while checking auth
	if (session().isPending) {
		return (
			<div class="flex justify-center items-center min-h-[400px]">
				<Loader2 class="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<ComponentErrorBoundary name="Connections">
			<div class="container mx-auto p-6">
			<div class="flex justify-between items-center mb-6">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Database Connections</h1>
					<p class="text-gray-600 mt-2">Manage your database connections</p>
				</div>
				<button
					onclick={() => setShowCreateForm(true)}
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
				>
					<Plus size={20} />
					Add Connection
				</button>
			</div>

			<Show when={showCreateForm()}>
				<ConnectionForm
					onSubmit={(data) => {
						createConnection().createConnection(data);
						setShowCreateForm(false);
					}}
					onCancel={() => setShowCreateForm(false)}
					isLoading={createConnection().isLoading}
				/>
			</Show>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<For each={connections().connections}>
					{(connection) => (
						<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
							<div class="flex items-start justify-between mb-4">
								<div class="flex items-center gap-3">
									<div
										class="w-4 h-4 rounded-full"
										style={{ "background-color": connection.color }}
									/>
									<div>
										<h3 class="font-semibold text-gray-900">{connection.name}</h3>
										<p class="text-sm text-gray-500 capitalize">{connection.type}</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<button
										onclick={() => toggleConnectionActive().toggleActive({ 
											id: connection.id, 
											isActive: connection.isActive !== "true" 
										})}
										disabled={toggleConnectionActive().isLoading}
										class="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
										title={connection.isActive === "true" ? "Deactivate" : "Activate"}
									>
										<Show when={connection.isActive === "true"} fallback={<EyeOff size={16} />}>
											<Eye size={16} />
										</Show>
									</button>
									<button
										onclick={() => setEditingConnection(connection.id)}
										class="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<Settings size={16} />
									</button>
									<button
										onclick={() => {
											if (confirm("Are you sure you want to delete this connection?")) {
												deleteConnection().deleteConnection({ id: connection.id });
											}
										}}
										disabled={deleteConnection().isLoading}
										class="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>

							<Show when={connection.description}>
								<p class="text-gray-600 text-sm mb-4">{connection.description}</p>
							</Show>

							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2 text-sm text-gray-500">
									<Database size={14} />
									<span>{connection.database || "N/A"}</span>
								</div>
								<button
									onclick={() => testConnection().testConnection(connection as any)}
									disabled={testConnection().isLoading}
									class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
								>
									<TestTube size={14} />
									Test
								</button>
							</div>

							<Show when={testConnection().data && testConnection().variables === connection}>
								<div class={`mt-3 p-2 rounded text-sm ${
									testConnection().data.success 
										? "bg-green-50 text-green-700 border border-green-200" 
										: "bg-red-50 text-red-700 border border-red-200"
								}`}>
									{testConnection().data.success ? "✓ Connection successful" : `✗ ${testConnection().data.error || "Connection failed"}`}
								</div>
							</Show>

							<Show when={editingConnection() === connection.id}>
								<div class="mt-4 pt-4 border-t border-gray-200">
									<ConnectionForm
										connection={connection}
										onSubmit={(data) => {
											updateConnection().updateConnection({ ...data, id: connection.id });
											setEditingConnection(null);
										}}
										onCancel={() => setEditingConnection(null)}
										isLoading={updateConnection().isLoading}
									/>
								</div>
							</Show>
						</div>
					)}
				</For>
			</div>

			<Show when={connections().isLoading}>
				<div class="flex justify-center py-8">
					<Loader2 class="w-8 h-8 animate-spin text-blue-600" />
				</div>
			</Show>

			<Show when={connections().error}>
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					Error loading connections: {connections().error?.message}
				</div>
			</Show>
		</div>
		</ComponentErrorBoundary>
	);
}

interface ConnectionFormProps {
	connection?: any;
	onSubmit: (data: any) => void;
	onCancel: () => void;
	isLoading: boolean;
}

function ConnectionForm(props: ConnectionFormProps) {
	const [formData, setFormData] = createSignal({
		name: props.connection?.name || "",
		description: props.connection?.description || "",
		type: props.connection?.type || "postgres",
		host: props.connection?.host || "",
		port: props.connection?.port || "",
		database: props.connection?.database || "",
		username: props.connection?.username || "",
		password: props.connection?.password || "",
		connectionString: props.connection?.connectionString || "",
		color: props.connection?.color || "#3b82f6",
	});

	const [useConnectionString, setUseConnectionString] = createSignal(
		!!props.connection?.connectionString
	);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const data = formData();
		
		// Clear unused fields based on connection method
		if (useConnectionString()) {
			props.onSubmit({
				...data,
				host: undefined,
				port: undefined,
				database: undefined,
				username: undefined,
				password: undefined,
			});
		} else {
			props.onSubmit({
				...data,
				connectionString: undefined,
			});
		}
	};

	return (
		<div class="bg-gray-50 p-4 rounded-lg">
			<form onSubmit={handleSubmit} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Name *
						</label>
						<input
							type="text"
							value={formData().name}
							onInput={(e) => setFormData(prev => ({ ...prev, name: e.currentTarget.value }))}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Database Type *
						</label>
						<select
							value={formData().type}
							onChange={(e) => setFormData(prev => ({ ...prev, type: e.currentTarget.value }))}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="postgres">PostgreSQL</option>
							<option value="mysql">MySQL</option>
							<option value="sqlite">SQLite</option>
							<option value="mongodb">MongoDB</option>
						</select>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						value={formData().description}
						onInput={(e) => setFormData(prev => ({ ...prev, description: e.currentTarget.value }))}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows="2"
					/>
				</div>

				<div>
					<label class="flex items-center gap-2 mb-3">
						<input
							type="checkbox"
							checked={useConnectionString()}
							onChange={(e) => setUseConnectionString(e.currentTarget.checked)}
							class="rounded"
						/>
						<span class="text-sm text-gray-700">Use connection string</span>
					</label>
				</div>

				<Show when={useConnectionString()} fallback={
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Host *
							</label>
							<input
								type="text"
								value={formData().host}
								onInput={(e) => setFormData(prev => ({ ...prev, host: e.currentTarget.value }))}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Port
							</label>
							<input
								type="text"
								value={formData().port}
								onInput={(e) => setFormData(prev => ({ ...prev, port: e.currentTarget.value }))}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Database *
							</label>
							<input
								type="text"
								value={formData().database}
								onInput={(e) => setFormData(prev => ({ ...prev, database: e.currentTarget.value }))}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Username
							</label>
							<input
								type="text"
								value={formData().username}
								onInput={(e) => setFormData(prev => ({ ...prev, username: e.currentTarget.value }))}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div class="md:col-span-2">
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Password
							</label>
							<input
								type="password"
								value={formData().password}
								onInput={(e) => setFormData(prev => ({ ...prev, password: e.currentTarget.value }))}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				}>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Connection String *
						</label>
						<input
							type="text"
							value={formData().connectionString}
							onInput={(e) => setFormData(prev => ({ ...prev, connectionString: e.currentTarget.value }))}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="postgresql://user:password@host:port/database"
							required
						/>
					</div>
				</Show>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Color
					</label>
					<input
						type="color"
						value={formData().color}
						onInput={(e) => setFormData(prev => ({ ...prev, color: e.currentTarget.value }))}
						class="w-full h-10 border border-gray-300 rounded-md"
					/>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						onclick={props.onCancel}
						class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={props.isLoading}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
					>
						{props.isLoading ? "Saving..." : props.connection ? "Update" : "Create"}
					</button>
				</div>
			</form>
		</div>
	);
}