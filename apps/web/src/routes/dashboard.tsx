import { createFileRoute, Link } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { Database, Plus, Eye, Settings, Loader2 } from "lucide-solid";
import { useAuthGuard } from "@/lib/route-guards";
import { useConnections } from "@/lib/orpc-hooks";
import { ComponentErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const session = useAuthGuard(navigate);

	// const privateData = usePrivateData(); // Temporarily disabled due to oRPC issue
	// const connections = useConnections(); // Temporarily disabled due to oRPC issue

	// Show loading state while checking auth
	if (session().isPending) {
		return (
			<div class="flex justify-center items-center min-h-[400px]">
				<Loader2 class="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<ComponentErrorBoundary name="Dashboard">
			<div class="container mx-auto p-6">
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
								<p class="text-2xl font-bold text-gray-900">0</p>
							</div>
							<Database class="h-8 w-8 text-blue-600" />
						</div>
					</div>

					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-500">Active Connections</p>
								<p class="text-2xl font-bold text-green-600">0</p>
							</div>
							<Eye class="h-8 w-8 text-green-600" />
						</div>
					</div>

					<div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-500">Database Types</p>
								<p class="text-2xl font-bold text-purple-600">0</p>
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

					{/* Connections list temporarily disabled due to oRPC issue */}
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
			</div>
		</ComponentErrorBoundary>
	);
}
