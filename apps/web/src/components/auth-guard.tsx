import { useNavigate } from '@solidjs/router';
import { createEffect, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';

type TProps = {
	children: JSX.Element;
	requireAdmin?: boolean;
	fallbackPath?: string;
};

export function AuthGuard(props: TProps) {
	const session = authClient.useSession();
	const navigate = useNavigate();

	createEffect(() => {
		const sessionData = session();
		
		if (sessionData.isPending) {
			return;
		}

		if (!sessionData.data) {
			navigate(props.fallbackPath || '/login');
			return;
		}

		if (props.requireAdmin) {
			const user = sessionData.data.user as any;
			if (!user || !('role' in user) || user.role !== 'admin') {
				navigate('/dashboard');
				return;
			}
		}
	});

	return (
		<Show when={!session().isPending && session().data} fallback={<div>Loading...</div>}>
			{props.children}
		</Show>
	);
}
