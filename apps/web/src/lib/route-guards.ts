import { authClient } from "./auth-client";
import type { NavigateOptions } from "@tanstack/solid-router";
import { createEffect } from "solid-js";

/**
 * Hook for protecting routes that require authentication
 */
export function useAuthGuard(
	navigate: (options: NavigateOptions) => void,
	redirectTo = "/login"
) {
	const session = authClient.useSession();

	createEffect(() => {
		if (!session().isPending && !session().data) {
			navigate({ to: redirectTo });
		}
	});

	return session;
}

/**
 * Hook for redirecting authenticated users away from auth pages
 */
export function useGuestGuard(
	navigate: (options: NavigateOptions) => void,
	redirectTo = "/dashboard"
) {
	const session = authClient.useSession();

	createEffect(() => {
		if (!session().isPending && session().data) {
			navigate({ to: redirectTo });
		}
	});

	return session;
}

/**
 * Hook that provides session state without redirects
 */
export function useSession() {
	return authClient.useSession();
}