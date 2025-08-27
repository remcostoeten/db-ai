import { ProtectedRoute } from '@/components/protected-route';
import ConnectionView from '@/views/connection-view';

export default function ConnectionsRoute() {
	return (
		<ProtectedRoute>
			<ConnectionView />
		</ProtectedRoute>
	);
}
