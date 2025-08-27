import { createFileRoute } from '@tanstack/solid-router';
import { Authentication } from '@/features/auth/components/auth-view';

export const Route = createFileRoute('/login')({
	component: RouteComponent,
});

function RouteComponent() {
	return <Authentication defaultMode="signup" />;
}
