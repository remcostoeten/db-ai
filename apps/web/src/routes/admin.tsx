import { AdminRoute as AdminProtectedRoute } from '@/components/protected-route';
import AdminView from '@/views/admin-view';

export default function AdminRoute() {
	return (
		<AdminProtectedRoute>
			<AdminView />
		</AdminProtectedRoute>
	);
}
