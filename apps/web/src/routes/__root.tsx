import { createRootRoute } from '@tanstack/solid-router';
import RootView from '@/views/root-view';

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return <RootView />;
}
