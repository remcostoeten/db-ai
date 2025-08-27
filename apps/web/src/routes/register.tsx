import { GuestOnlyRoute } from '@/components/protected-route';
import { Authentication } from '@/features/auth/components/auth-view';

export default function RegisterRoute() {
	return (
		<GuestOnlyRoute>
			<Authentication defaultMode="signup" />
		</GuestOnlyRoute>
	);
}
