import { createResource, Match, Switch } from 'solid-js';
import { client } from '../utils/orpc';

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

export default function IndexView() {
	const [healthCheck] = createResource(async () => {
		try {
			return await client.healthCheck();
		} catch (error) {
			console.error('Health check failed:', error);
			throw error;
		}
	});

	return (
		<div class="container mx-auto max-w-3xl px-4 py-2">
			<pre class="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
			<div class="grid gap-6">
				<section class="rounded-lg border p-4">
					<h2 class="mb-2 font-medium">API Status</h2>
					<Switch>
						<Match when={healthCheck.loading}>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 animate-pulse rounded-full bg-gray-500" />{' '}
								<span class="text-muted-foreground text-sm">
									Checking...
								</span>
							</div>
						</Match>
						<Match when={healthCheck.error}>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-red-500" />
								<span class="text-muted-foreground text-sm">
									Disconnected
								</span>
							</div>
						</Match>
						<Match when={healthCheck() !== undefined}>
							<div class="flex items-center gap-2">
								<div
									class={`h-2 w-2 rounded-full ${healthCheck() === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}
								/>
								<span class="text-muted-foreground text-sm">
									{healthCheck() === 'OK'
										? 'Connected'
										: 'Disconnected'}
								</span>
							</div>
						</Match>
					</Switch>
				</section>
			</div>
		</div>
	);
}
