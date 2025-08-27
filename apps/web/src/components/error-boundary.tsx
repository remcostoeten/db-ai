import { createSignal, Show, type JSX } from "solid-js";
import { ErrorBoundary } from "solid-js";
import { AlertCircle, RefreshCw } from "lucide-solid";

interface ErrorFallbackProps {
	error: Error;
	reset: () => void;
}

function ErrorFallback(props: ErrorFallbackProps) {
	const [isRetrying, setIsRetrying] = createSignal(false);

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
			props.reset();
		} finally {
			setIsRetrying(false);
		}
	};

	return (
		<div class="min-h-[400px] flex items-center justify-center p-6">
			<div class="text-center max-w-md">
				<AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
				<h2 class="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
				<p class="text-gray-600 mb-4">
					{props.error.message || "An unexpected error occurred"}
				</p>
				<button
					onClick={handleRetry}
					disabled={isRetrying()}
					class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
				>
					<RefreshCw class={`w-4 h-4 ${isRetrying() ? "animate-spin" : ""}`} />
					{isRetrying() ? "Retrying..." : "Try Again"}
				</button>
				<details class="mt-4 text-left">
					<summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
						Technical Details
					</summary>
					<pre class="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
						{props.error.stack}
					</pre>
				</details>
			</div>
		</div>
	);
}

interface AppErrorBoundaryProps {
	children: JSX.Element;
	fallback?: (error: Error, reset: () => void) => JSX.Element;
}

export function AppErrorBoundary(props: AppErrorBoundaryProps) {
	return (
		<ErrorBoundary
			fallback={(error, reset) => 
				props.fallback ? props.fallback(error, reset) : <ErrorFallback error={error} reset={reset} />
			}
		>
			{props.children}
		</ErrorBoundary>
	);
}

/**
 * Smaller error boundary for component-level errors
 */
export function ComponentErrorBoundary(props: { children: JSX.Element; name?: string }) {
	return (
		<ErrorBoundary
			fallback={(error, reset) => (
				<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
					<div class="flex items-center gap-2 text-red-800 mb-2">
						<AlertCircle class="w-4 h-4" />
						<span class="font-medium">
							{props.name ? `${props.name} Error` : "Component Error"}
						</span>
					</div>
					<p class="text-sm text-red-700 mb-3">{error.message}</p>
					<button
						onClick={reset}
						class="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
					>
						Retry
					</button>
				</div>
			)}
		>
			{props.children}
		</ErrorBoundary>
	);
}