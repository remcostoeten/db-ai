import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, Show, createMemo } from "solid-js";
import { 
	Database, 
	Table, 
	Columns, 
	RefreshCw, 
	ChevronRight, 
	ChevronDown,
	Key,
	Link,
	Hash,
	Type,
	Calendar,
	FileText,
	Loader2
} from "lucide-solid";
import { useAuthGuard } from "@/lib/route-guards";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { 
	useConnections, 
	useDatabases, 
	useTables, 
	useColumns,
	useSyncDatabases,
	useSyncTables,
	useSyncColumns
} from "@/lib/orpc-hooks";

export const Route = createFileRoute("/database-browser")({
	component: DatabaseBrowserRoute,
});

function DatabaseBrowserRoute() {
	const navigate = Route.useNavigate();
	const session = useAuthGuard(navigate);
	const [selectedConnection, setSelectedConnection] = createSignal<string | null>(null);
	const [selectedDatabase, setSelectedDatabase] = createSignal<string | null>(null);
	const [selectedTable, setSelectedTable] = createSignal<string | null>(null);
	const [expandedDatabases, setExpandedDatabases] = createSignal<Set<string>>(new Set());
	const [expandedTables, setExpandedTables] = createSignal<Set<string>>(new Set());

	// Use standardized hooks
	const connections = useConnections();
	const databases = useDatabases(selectedConnection() || "");
	const tables = useTables(selectedDatabase() || "");
	const columns = useColumns(selectedTable() || "");
	
	const syncDatabases = useSyncDatabases();
	const syncTables = useSyncTables();
	const syncColumns = useSyncColumns();

	const selectedConnectionData = createMemo(() => 
		connections().connections.find(conn => conn.id === selectedConnection())
	);

	const selectedDatabaseData = createMemo(() =>
		databases().databases.find(db => db.id === selectedDatabase())
	);

	const selectedTableData = createMemo(() =>
		tables().tables.find(table => table.id === selectedTable())
	);

	const toggleDatabaseExpansion = (databaseId: string) => {
		const expanded = expandedDatabases();
		if (expanded.has(databaseId)) {
			expanded.delete(databaseId);
		} else {
			expanded.add(databaseId);
		}
		setExpandedDatabases(new Set(expanded));
	};

	const toggleTableExpansion = (tableId: string) => {
		const expanded = expandedTables();
		if (expanded.has(tableId)) {
			expanded.delete(tableId);
		} else {
			expanded.add(tableId);
		}
		setExpandedTables(new Set(expanded));
	};

	const getColumnIcon = (column: any) => {
		if (column.isPrimaryKey === "true") return <Key size={14} class="text-yellow-600" />;
		if (column.isForeignKey === "true") return <Link size={14} class="text-blue-600" />;
		if (column.type.includes("int") || column.type.includes("number")) return <Hash size={14} class="text-green-600" />;
		if (column.type.includes("date") || column.type.includes("time")) return <Calendar size={14} class="text-purple-600" />;
		if (column.type.includes("text") || column.type.includes("varchar") || column.type.includes("char")) return <FileText size={14} class="text-gray-600" />;
		return <Type size={14} class="text-gray-600" />;
	};

	// Show loading state while checking auth
	if (session().isPending) {
		return (
			<div class="flex justify-center items-center min-h-[400px]">
				<Loader2 class="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<ComponentErrorBoundary name="Database Browser">
			<div class="container mx-auto p-6">
			<div class="mb-6">
				<h1 class="text-3xl font-bold text-gray-900">Database Browser</h1>
				<p class="text-gray-600 mt-2">Explore your database structure and schema</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Connection & Database Tree */}
				<div class="lg:col-span-1">
					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-4">
						<h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Database size={20} />
							Database Structure
						</h2>

						{/* Connection Selection */}
						<div class="mb-4">
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Connection
							</label>
							<select
								value={selectedConnection() || ""}
								onChange={(e) => {
									setSelectedConnection(e.currentTarget.value || null);
									setSelectedDatabase(null);
									setSelectedTable(null);
								}}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select a connection...</option>
								<For each={connections().activeConnections}>
									{(connection) => (
										<option value={connection.id}>
											{connection.name} ({connection.type})
										</option>
									)}
								</For>
							</select>
						</div>

						{/* Database Tree */}
						<Show when={selectedConnection()}>
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<h3 class="text-sm font-medium text-gray-700">Databases</h3>
									<button
										onclick={() => syncDatabases().syncDatabases({ connectionId: selectedConnection()! })}
										disabled={syncDatabases().isLoading}
										class="text-blue-600 hover:text-blue-700 disabled:opacity-50"
										title="Sync databases"
									>
										<RefreshCw size={14} class={syncDatabases().isLoading ? "animate-spin" : ""} />
									</button>
								</div>

								<div class="max-h-96 overflow-y-auto">
									<For each={databases().databases}>
										{(database) => (
											<div class="border-l-2 border-gray-200 ml-2 pl-2">
												<div class="flex items-center gap-2 py-1">
													<button
														onclick={() => {
															toggleDatabaseExpansion(database.id);
															setSelectedDatabase(database.id);
															setSelectedTable(null);
														}}
														class="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 w-full text-left"
													>
														<Show when={expandedDatabases().has(database.id)} fallback={<ChevronRight size={14} />}>
															<ChevronDown size={14} />
														</Show>
														<Database size={14} />
														{database.name}
													</button>
												</div>

												<Show when={expandedDatabases().has(database.id)}>
													<div class="ml-4 mt-2 space-y-1">
														<div class="flex items-center justify-between">
															<span class="text-xs text-gray-500">Tables</span>
															<button
																onclick={() => syncTables().syncTables({ 
																	databaseId: database.id,
																	databaseName: database.name 
																})}
																disabled={syncTables().isLoading}
																class="text-blue-600 hover:text-blue-700 disabled:opacity-50"
																title="Sync tables"
															>
																<RefreshCw size={12} class={syncTables().isLoading ? "animate-spin" : ""} />
															</button>
														</div>
														<For each={tables().tables.filter(table => table.databaseId === database.id)}>
															{(table) => (
																<div class="border-l-2 border-gray-200 ml-2 pl-2">
																	<button
																		onclick={() => {
																			toggleTableExpansion(table.id);
																			setSelectedTable(table.id);
																		}}
																		class="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 w-full text-left py-1"
																	>
																		<Show when={expandedTables().has(table.id)} fallback={<ChevronRight size={12} />}>
																			<ChevronDown size={12} />
																		</Show>
																		<Table size={12} />
																		{table.name}
																		<Show when={table.rowCount}>
																			<span class="text-gray-400">({table.rowCount})</span>
																		</Show>
																	</button>

																	<Show when={expandedTables().has(table.id)}>
																		<div class="ml-4 mt-1 space-y-1">
																			<div class="flex items-center justify-between">
																				<span class="text-xs text-gray-400">Columns</span>
																				<button
																					onclick={() => syncColumns().syncColumns({ 
																						tableId: table.id,
																						schemaName: table.schema 
																					})}
																					disabled={syncColumns().isLoading}
																					class="text-blue-600 hover:text-blue-700 disabled:opacity-50"
																					title="Sync columns"
																				>
																					<RefreshCw size={10} class={syncColumns().isLoading ? "animate-spin" : ""} />
																				</button>
																			</div>
																			<For each={columns().columns.filter(col => col.tableId === table.id)}>
																				{(column) => (
																					<div class="flex items-center gap-2 text-xs text-gray-500 ml-2">
																						{getColumnIcon(column)}
																						{column.name}
																						<span class="text-gray-400">({column.type})</span>
																					</div>
																				)}
																			</For>
																		</div>
																	</Show>
																</div>
															)}
														</For>
													</div>
												</Show>
											</div>
										)}
									</For>
								</div>
							</div>
						</Show>
					</div>
				</div>

				{/* Details Panel */}
				<div class="lg:col-span-2">
					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
						<Show when={selectedTableData()} fallback={
							<Show when={selectedDatabaseData()} fallback={
								<Show when={selectedConnectionData()} fallback={
									<div class="text-center py-12 text-gray-500">
										<Database size={48} class="mx-auto mb-4 text-gray-300" />
										<p>Select a connection to start exploring</p>
									</div>
								}>
									<div>
										<h2 class="text-xl font-semibold text-gray-900 mb-4">
											Connection: {selectedConnectionData()!.name}
										</h2>
										<div class="grid grid-cols-2 gap-4">
											<div>
												<label class="block text-sm font-medium text-gray-500">Type</label>
												<p class="text-gray-900 capitalize">{selectedConnectionData()!.type}</p>
											</div>
											<div>
												<label class="block text-sm font-medium text-gray-500">Host</label>
												<p class="text-gray-900">{selectedConnectionData()!.host || "N/A"}</p>
											</div>
											<div>
												<label class="block text-sm font-medium text-gray-500">Database</label>
												<p class="text-gray-900">{selectedConnectionData()!.database || "N/A"}</p>
											</div>
											<div>
												<label class="block text-sm font-medium text-gray-500">Status</label>
												<p class={`font-medium ${selectedConnectionData()!.isActive === "true" ? "text-green-600" : "text-red-600"}`}>
													{selectedConnectionData()!.isActive === "true" ? "Active" : "Inactive"}
												</p>
											</div>
										</div>
									</div>
								</Show>
							}>
								<div>
									<h2 class="text-xl font-semibold text-gray-900 mb-4">
										Database: {selectedDatabaseData()!.name}
									</h2>
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label class="block text-sm font-medium text-gray-500">Type</label>
											<p class="text-gray-900 capitalize">{selectedDatabaseData()!.type}</p>
										</div>
										<div>
											<label class="block text-sm font-medium text-gray-500">Tables</label>
											<p class="text-gray-900">{tables().tables.filter(t => t.databaseId === selectedDatabase()).length || 0}</p>
										</div>
									</div>
								</div>
							</Show>
						}>
							<div>
								<h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
									<Table size={24} />
									Table: {selectedTableData()!.name}
								</h2>

								<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
									<div class="bg-gray-50 p-4 rounded-lg">
										<label class="block text-sm font-medium text-gray-500 mb-1">Schema</label>
										<p class="text-lg font-semibold text-gray-900">{selectedTableData()!.schema}</p>
									</div>
									<div class="bg-gray-50 p-4 rounded-lg">
										<label class="block text-sm font-medium text-gray-500 mb-1">Type</label>
										<p class="text-lg font-semibold text-gray-900 capitalize">{selectedTableData()!.type}</p>
									</div>
									<div class="bg-gray-50 p-4 rounded-lg">
										<label class="block text-sm font-medium text-gray-500 mb-1">Rows</label>
										<p class="text-lg font-semibold text-gray-900">{selectedTableData()!.rowCount || "N/A"}</p>
									</div>
								</div>

								<Show when={selectedTableData()!.comment}>
									<div class="mb-6">
										<label class="block text-sm font-medium text-gray-500 mb-1">Comment</label>
										<p class="text-gray-700">{selectedTableData()!.comment}</p>
									</div>
								</Show>

								<div>
									<h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
										<Columns size={20} />
										Columns ({columns().columns.filter(col => col.tableId === selectedTable()).length || 0})
									</h3>

									<div class="overflow-x-auto">
										<table class="min-w-full divide-y divide-gray-200">
											<thead class="bg-gray-50">
												<tr>
													<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
													<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
													<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nullable</th>
													<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
													<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keys</th>
												</tr>
											</thead>
											<tbody class="bg-white divide-y divide-gray-200">
												<For each={columns().columns.filter(col => col.tableId === selectedTable()).sort((a, b) => 
													parseInt(a.ordinalPosition) - parseInt(b.ordinalPosition)
												)}>
													{(column) => (
														<tr>
															<td class="px-6 py-4 whitespace-nowrap">
																<div class="flex items-center gap-2">
																	{getColumnIcon(column)}
																	<span class="text-sm font-medium text-gray-900">{column.name}</span>
																</div>
															</td>
															<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																{column.type}
															</td>
															<td class="px-6 py-4 whitespace-nowrap">
																<span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																	column.isNullable === "true" 
																		? "bg-yellow-100 text-yellow-800" 
																		: "bg-gray-100 text-gray-800"
																}`}>
																	{column.isNullable === "true" ? "Yes" : "No"}
																</span>
															</td>
															<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																{column.defaultValue || "-"}
															</td>
															<td class="px-6 py-4 whitespace-nowrap">
																<div class="flex gap-1">
																	<Show when={column.isPrimaryKey === "true"}>
																		<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
																			PK
																		</span>
																	</Show>
																	<Show when={column.isForeignKey === "true"}>
																		<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
																			FK
																		</span>
																	</Show>
																</div>
																<Show when={column.referencedTable}>
																	<div class="text-xs text-gray-400 mt-1">
																		→ {column.referencedTable}.{column.referencedColumn}
																	</div>
																</Show>
															</td>
														</tr>
													)}
												</For>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</div>
		</ComponentErrorBoundary>
	);
}