import Header from "@/components/header";
import { Outlet, createRootRouteWithContext } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { AppErrorBoundary } from "@/components/error-boundary";
import type { QueryClient } from "@tanstack/solid-query";
import type { orpc } from "../utils/orpc";

export interface RouterContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<AppErrorBoundary>
			<div class="grid grid-rows-[auto_1fr] h-svh">
				<Header />
				<Outlet />
			</div>
			<SolidQueryDevtools />
			<TanStackRouterDevtools />
		</AppErrorBoundary>
	);
}
