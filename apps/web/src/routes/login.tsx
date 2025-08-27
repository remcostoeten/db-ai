import { GuestOnlyRoute } from '@/components/protected-route';
import LoginView from '@/views/login-view';

export default function LoginRoute() {
	return (
		<GuestOnlyRoute>
			<LoginView />
		</GuestOnlyRoute>
	);
}
