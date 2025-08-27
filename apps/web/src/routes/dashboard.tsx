import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { createEffect, Show, For } from "solid-js";
import { Database, Plus, Eye, Settings } from "lucide-solid";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const session = authClient.useSession();
	const navigate = Route.useNavigate();

	const privateData = useQuery(() => orpc.privateData.queryOptions());
	const connections = useQuery(() => orpc.connection.getAll.queryOptions());

	createEffect(() => {
		if (!session().data && !session().isPending) {
			navigate({
				to: "/login",
			});
		}
	});

	const activeConnections = () => connections.data?.filter(conn => conn.isActive === "true") || [];
	const totalConnections = () => connections.data?.length || 0;

	return (
		<div class="container mx-auto p-6">
			<Show when={session().isPending}>
				<div class="flex justify-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			</Show>

			<Show when={!session().isPending && session().data}>
				<div class="mb-8">
					<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p class="text-gray-600 mt-2">Welcome back, {session().data?.user.name}!</p>
				</div>

				{/* Overview Cards */}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-500">Total Connections</p>
								<p class="text-2xl font-bold text-gray-900">{totalConnections()}</p>
							</div>
							<Database class="h-8 w-8 text-blue-600" />
						</div>
					</div>

					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-500">Active Connections</p>
								<p class="text-2xl font-bold text-green-600">{activeConnections().length}</p>
							</div>
							<Eye class="h-8 w-8 text-green-600" />
						</div>
					</div>

					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-500">Database Types</p>
								<p class="text-2xl font-bold text-purple-600">
									{new Set(connections.data?.map(conn => conn.type)).size || 0}
								</p>
							</div>
							<Settings class="h-8 w-8 text-purple-600" />
						</div>
					</div>
				</div>

				{/* Recent Connections */}
				<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-semibold text-gray-900">Recent Connections</h2>
						<Link 
							to="/connections" 
							class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
						>
							<Plus size={16} />
							Add Connection
						</Link>
					</div>

					<Show when={connections.isLoading}>
						<div class="flex justify-center py-4">
							<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						</div>
					</Show>

					<Show when={!connections.isLoading && totalConnections() === 0}>
						<div class="text-center py-8 text-gray-500">
							<Database size={48} class="mx-auto mb-4 text-gray-300" />
							<p class="text-lg font-medium">No connections yet</p>
							<p class="text-sm">Get started by creating your first database connection</p>
							<Link 
								to="/connections" 
								class="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								<Plus size={16} />
								Create Connection
							</Link>
						</div>
					</Show>

					<Show when={!connections.isLoading && totalConnections() > 0}>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<For each={connections.data?.slice(0, 6)}>
								{(connection) => (
									<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
										<div class="flex items-center justify-between mb-3">
											<div class="flex items-center gap-2">
												<div
													class="w-3 h-3 rounded-full"
													style={{ "background-color": connection.color }}
												/>
												<h3 class="font-medium text-gray-900 truncate">{connection.name}</h3>
											</div>
											<span class={`text-xs px-2 py-1 rounded-full ${
												connection.isActive === "true" 
													? "bg-green-100 text-green-800" 
													: "bg-gray-100 text-gray-800"
											}`}>
												{connection.isActive === "true" ? "Active" : "Inactive"}
											</span>
										</div>
										<p class="text-sm text-gray-500 capitalize mb-2">{connection.type}</p>
										<Show when={connection.description}>
											<p class="text-xs text-gray-400 truncate">{connection.description}</p>
										</Show>
									</div>
								)}
							</For>
						</div>

						<Show when={totalConnections() > 6}>
							<div class="mt-4 text-center">
								<Link 
									to="/connections" 
									class="text-blue-600 hover:text-blue-700 font-medium"
								>
									View all {totalConnections()} connections →
								</Link>
							</div>
						</Show>
					</Show>
				</div>

				{/* Quick Actions */}
				<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link 
							to="/connections" 
							class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<Database class="h-6 w-6 text-blue-600" />
							<div>
								<p class="font-medium text-gray-900">Manage Connections</p>
								<p class="text-sm text-gray-500">Add, edit, and test database connections</p>
							</div>
						</Link>
						<Link 
							to="/database-browser" 
							class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<Eye class="h-6 w-6 text-green-600" />
							<div>
								<p class="font-medium text-gray-900">Browse Databases</p>
								<p class="text-sm text-gray-500">Explore database structure and schema</p>
							</div>
						</Link>
					</div>
				</div>
			</Show>
		</div>
	);
}
