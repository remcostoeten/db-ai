import { Show, createSignal, createEffect, createResource } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';
import { client } from '@/utils/orpc';
import type { TUserFilters } from '@/types/user';

export default function AdminView() {
	const session = authClient.useSession();
	const [filters, setFilters] = createSignal<TUserFilters>({
		sort: 'desc',
		roles: 'all',
		search: '',
		limit: 50,
		offset: 0,
	});
	createEffect(() => {
		const sessionData = session();
		if (sessionData.data?.user) {
			console.log('AdminView - User email:', sessionData.data.user.email);
		}
	});
	
	const [userCount] = createResource(async () => {
		const response = await client.admin.getUserCount({});
		return response;
	});
	
	const [dashboardStats] = createResource(async () => {
		const response = await client.admin.getDashboardStats();
		return response;
	});
	
	function handleSortChange(sort: TUserFilters['sort']) {
		setFilters(prev => ({ ...prev, sort, offset: 0 }));
	}
	
	function handleRoleFilter(roles: TUserFilters['roles']) {
		setFilters(prev => ({ ...prev, roles, offset: 0 }));
	}
	
	function handleSearch(search: string) {
		setFilters(prev => ({ ...prev, search, offset: 0 }));
	}
	
	return (
		<div class="min-h-screen bg-gray-50">
			<div class="bg-white shadow">
				<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div class="flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold tracking-tight text-gray-900">
								Admin Dashboard
							</h1>
							<p class="mt-2 text-gray-600">
								Manage users and system settings
							</p>
						</div>
						<Show when={dashboardStats()}>
							<div class="flex space-x-4">
								<div class="text-center">
									<div class="text-2xl font-bold text-gray-900">{dashboardStats()?.totalUsers}</div>
									<div class="text-sm text-gray-500">Total Users</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold text-red-600">{dashboardStats()?.adminUsers}</div>
									<div class="text-sm text-gray-500">Admins</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold text-green-600">{dashboardStats()?.regularUsers}</div>
									<div class="text-sm text-gray-500">Regular Users</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold text-blue-600">{dashboardStats()?.activeSessions}</div>
									<div class="text-sm text-gray-500">Active Sessions</div>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</div>
			<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div class="rounded-lg bg-white shadow">
					<div class="border-b border-gray-200 px-6 py-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-medium text-gray-900">
								User Management
							</h2>
							<Show when={userCount()}>
								<span class="text-sm text-gray-500">{String(userCount())} total users</span>
							</Show>
						</div>
						
						{/* Filters */}
						<div class="mt-4 flex flex-wrap gap-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Search by email</label>
								<input
									type="text"
									placeholder="Search users..."
									value={filters().search || ''}
									onInput={(e) => handleSearch(e.currentTarget.value)}
									class="block w-60 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Filter by role</label>
								<select
									value={filters().roles}
									onChange={(e) => handleRoleFilter(e.currentTarget.value as TUserFilters['roles'])}
									class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
								>
									<option value="all">All Roles</option>
									<option value="admin">Admins Only</option>
									<option value="regular">Regular Users</option>
								</select>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
								<select
									value={filters().sort}
									onChange={(e) => handleSortChange(e.currentTarget.value as TUserFilters['sort'])}
									class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
								>
									<option value="desc">Newest First</option>
									<option value="asc">Oldest First</option>
									<option value="logindesc">Recent Login</option>
									<option value="loginasc">Oldest Login</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
					