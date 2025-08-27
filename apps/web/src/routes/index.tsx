import { createFileRoute, Link } from "@tanstack/solid-router";
import { useQuery } from "@tanstack/solid-query";
import { orpc } from "../utils/orpc";
import { Match, Switch } from "solid-js";
import { Video, Smartphone, Share2 } from "lucide-solid";

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
				
				<section class="rounded-lg border p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
					<div class="flex items-center gap-3 mb-4">
						<Video size={32} class="text-blue-600" />
						<h2 class="text-2xl font-bold text-blue-800">Webcam Streaming</h2>
					</div>
					<p class="text-gray-700 mb-6">
						Stream your webcam and view it on any device, anywhere. Perfect for remote monitoring, 
						video calls, or sharing your workspace with others.
					</p>
					
					<div class="grid md:grid-cols-3 gap-4 mb-6">
						<div class="text-center">
							<Video size={24} class="mx-auto mb-2 text-blue-600" />
							<h3 class="font-semibold text-sm">High Quality</h3>
							<p class="text-xs text-gray-600">HD video streaming</p>
						</div>
						<div class="text-center">
							<Smartphone size={24} class="mx-auto mb-2 text-green-600" />
							<h3 class="font-semibold text-sm">Mobile Ready</h3>
							<p class="text-xs text-gray-600">View on any device</p>
						</div>
						<div class="text-center">
							<Share2 size={24} class="mx-auto mb-2 text-purple-600" />
							<h3 class="font-semibold text-sm">Easy Sharing</h3>
							<p class="text-xs text-gray-600">Share with a simple link</p>
						</div>
					</div>
					
					<Link 
						to="/stream" 
						class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
					>
						<Video size={20} />
						Start Streaming
					</Link>
				</section>
			</div>
		</div>
	);
}
