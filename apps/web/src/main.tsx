import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { render } from "solid-js/web";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import { QueryClientProvider } from "@tanstack/solid-query";
import { orpc, queryClient } from "./utils/orpc";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPreloadStaleTime: 0,
	context: { orpc, queryClient },
});

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
}

const rootElement = document.getElementById("app");
if (rootElement) {
	render(() => <App />, rootElement);
}
