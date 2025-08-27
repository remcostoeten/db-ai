import { A } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';

export function UserMenu() {
	const session = authClient.useSession();
	const [isMenuOpen, setIsMenuOpen] = createSignal(false);

	function toggleMenu() {
		setIsMenuOpen(!isMenuOpen());
	}

	async function handleSignOut() {
		try {
			await authClient.signOut();
			setIsMenuOpen(false);
		} catch (error) {
			console.error('Failed to sign out:', error);
		}
	}
	function getInitial() {
		const n = session().data?.user.name as string | undefined;
		if (!n || n.length === 0) {
			return '?';
		}
		return n.charAt(0).toUpperCase();
	}

	function getName() {
		const n = session().data?.user.name as string | undefined;
		if (!n || n.length === 0) {
			return 'Account';
		}
		return n;
	}

	return (
		<div class="relative inline-block text-left">
			<Show when={session().isPending}>
				<div class="h-10 w-32 animate-[shimmer_2s_infinite] animate-pulse rounded-full bg-[length:200%_100%] bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
			</Show>

			<Show when={!(session().isPending || session().data)}>
				<A
					class="group hover:-translate-y-0.5 relative inline-flex items-center overflow-hidden rounded-full border border-slate-200/60 bg-white/80 px-5 py-2.5 font-medium text-slate-700 text-sm shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:border-slate-300/60 hover:bg-white/90 hover:shadow-slate-900/10 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
					href="/login"
				>
					<span class="relative z-10">Sign In</span>
					<div class="-z-10 absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</A>
			</Show>

			<Show when={!session().isPending && session().data}>
				<button
					aria-controls="user-menu-panel"
					aria-expanded={isMenuOpen()}
					aria-haspopup="menu"
					class="group hover:-translate-y-0.5 relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-slate-200/60 bg-white/80 px-3 py-2 font-medium text-slate-700 text-sm shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:border-slate-300/60 hover:bg-white/90 hover:shadow-slate-900/10 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
					onClick={toggleMenu}
					type="button"
				>
					<span class="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-white/80 transition-transform duration-300 group-hover:scale-105">
						<span class="font-semibold text-xs">
							{getInitial()}
						</span>
						<div class="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
					</span>
					<span class="hidden max-w-[8rem] truncate font-medium sm:block">
						{getName()}
					</span>
					<svg
						aria-hidden="true"
						class={`${isMenuOpen() ? 'rotate-180' : ''} h-4 w-4 text-slate-500 transition-all duration-300 group-hover:text-slate-700`}
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							clipRule="evenodd"
							d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
							fillRule="evenodd"
						/>
					</svg>
					<div class="-z-10 absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</button>

				<Show when={isMenuOpen()}>
					<div
						class="fade-in slide-in-from-top-2 absolute right-0 z-50 mt-4 w-80 origin-top-right animate-in rounded-2xl border border-slate-200/60 bg-white/90 p-3 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-xl duration-200"
						id="user-menu-panel"
					>
						<div class="flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-blue-50/30 p-4 transition-colors duration-200 hover:from-slate-50/80 hover:to-blue-50/50">
							<div class="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-white/80">
								<span class="font-semibold text-base">
									{getInitial()}
								</span>
								<div class="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate font-semibold text-base text-slate-900">
									{getName()}
								</div>
								<div class="truncate text-slate-600 text-sm">
									{session().data?.user.email}
								</div>
							</div>
						</div>

						<div class="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

						<button
							class="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-center font-semibold text-sm text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/30 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-2 active:scale-[0.98]"
							onClick={handleSignOut}
							type="button"
						>
							<span class="relative z-10">Sign Out</span>
							<div class="-z-10 absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
						</button>
					</div>
				</Show>
			</Show>
		</div>
	);
}
