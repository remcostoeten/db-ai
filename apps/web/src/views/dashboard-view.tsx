import { createResource, Show, Suspense } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';
import { client } from '@/utils/orpc';

export default function DashboardView() {
	const session = authClient.useSession();
	const [dashboardStats] = createResource(async () => {
		try {
			return await client.admin.getDashboardStats();
		} catch (error) {
			console.error('Failed to fetch dashboard stats:', error);
			return null;
		}
	});

	const [userCount] = createResource(async () => {
		try {
			return await client.admin.getUserCount({});
		} catch (error) {
			console.error('Failed to fetch user count:', error);
			return null;
		}
	});

	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<Show
					when={session()?.data?.user}
					fallback={<div>Please log in to view the dashboard.</div>}
				>
					<h1>Dashboard</h1>
					<p>Welcome {session()?.data?.user?.name}</p>
					<Show when={dashboardStats()}>
						<div>
							<h2>Dashboard Stats</h2>
							<pre>{JSON.stringify(dashboardStats(), null, 2)}</pre>
						</div>
					</Show>
					<Show when={userCount() !== null}>
						<div>
							<h2>User Count</h2>
							<p>Total Users: {userCount()}</p>
						</div>
					</Show>
				</Show>
			</Suspense>
		</div>
	);
}