import { createFileRoute } from "@tanstack/solid-router";
import { useQuery } from "@tanstack/solid-query";
import { orpc } from "../utils/orpc";
import { Match, Switch } from "solid-js";

export const Route = createFileRoute("/")({
	component: App,
});

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

function App() {
	const healthCheck = useQuery(() => orpc.healthCheck.queryOptions());

	return (
		<div class="container mx-auto max-w-3xl px-4 py-2">
			<pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
			<div class="grid gap-6">
				<section class="rounded-lg border p-4">
					<h2 class="mb-2 font-medium">API Status</h2>
					<Switch>
						<Match when={healthCheck.isPending}>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />{" "}
								<span class="text-sm text-muted-foreground">Checking...</span>
							</div>
						</Match>
						<Match when={healthCheck.isError}>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-red-500" />
								<span class="text-sm text-muted-foreground">Disconnected</span>
							</div>
						</Match>
						<Match when={healthCheck.isSuccess}>
							<div class="flex items-center gap-2">
								<div
									class={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
								/>
								<span class="text-sm text-muted-foreground">
									{healthCheck.data ? "Connected" : "Disconnected"}
								</span>
							</div>
						</Match>
					</Switch>
				</section>
			</div>
		</div>
	);
}
