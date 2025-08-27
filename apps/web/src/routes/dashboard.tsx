import { createResource } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';
import { client } from '@/utils/orpc';
import { ProtectedRoute } from '@/components/protected-route';
import DashboardView from '@/views/dashboard-view';

export default function DashboardRoute() {
	const session = authClient.useSession();

	const [userRole] = createResource(
		() => session()?.data?.user?.id,
		async (userId) => {
			if (!userId) return null;
			try {
				return await client.user.getRole();
			} catch (error) {
				console.error('Failed to fetch user role:', error);
				return null;
			}
		}
	);

	// You can still access user data inside the protected component
	console.log('Dashboard - User role (from API):', userRole());
	console.log('Dashboard - Full user (from useSession):', session()?.data?.user);

	return (
		<ProtectedRoute>
			<DashboardView />
		</ProtectedRoute>
	);
}
