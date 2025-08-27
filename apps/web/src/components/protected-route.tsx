import { useNavigate } from '@solidjs/router';
import { createEffect, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';
import { AuthGuard } from './auth-guard';

type TProtectedRouteProps = {
	children: JSX.Element;
	requireAdmin?: boolean;
	fallbackPath?: string;
};

export function ProtectedRoute(props: TProtectedRouteProps) {
	return (
		<AuthGuard 
			requireAdmin={props.requireAdmin} 
			fallbackPath={props.fallbackPath}
		>
			{props.children}
		</AuthGuard>
	);
}

export function AdminRoute(props: { children: JSX.Element }) {
	return (
		<ProtectedRoute requireAdmin={true}>
			{props.children}
		</ProtectedRoute>
	);
}

type TGuestOnlyProps = {
	children: JSX.Element;
	redirectPath?: string;
};

export function GuestOnlyRoute(props: TGuestOnlyProps) {
	const session = authClient.useSession();
	const navigate = useNavigate();

	createEffect(() => {
		const sessionData = session();
		
		if (sessionData.isPending) {
			return;
		}

		if (sessionData.data) {
			navigate(props.redirectPath || '/dashboard');
			return;
		}
	});

	return (
		<Show when={!session().isPending && !session().data} fallback={<div>Loading...</div>}>
			{props.children}
		</Show>
	);
}
