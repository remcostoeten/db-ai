import { A } from '@solidjs/router';
import {
	Bell,
	Building,
	CreditCard,
	HelpCircle,
	LogOut,
	Settings,
	Shield,
	Users,
} from 'lucide-solid';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { authClient } from '@/core/utilities/auth-client';

export function UserDropdown() {
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

	createEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.shiftKey && event.key === 'L' && session().data) {
				event.preventDefault();
				handleSignOut();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
	});

	const menuItems = [
		{ icon: Settings, label: 'Settings', href: '/settings' },
		{ icon: Bell, label: 'Notifications', href: '/notifications' },
		{ icon: Shield, label: 'Privacy', href: '/privacy' },
		{ icon: CreditCard, label: 'Billing', href: '/billing' },
		{ icon: Users, label: 'Team', href: '/team' },
		{ icon: Building, label: 'Organization', href: '/organization' },
		{ icon: HelpCircle, label: 'Help & Support', href: '/help' },
	];

	return (
		<div class="relative inline-block text-left">
			<Show when={session().isPending}>
				<div class="flex h-10 w-32 items-center gap-3 rounded-md border bg-muted p-2">
					<div class="/20 h-6 w-6 animate-pulse rounded-full bg-muted-foreground" />
					<div class="flex-1 space-y-1">
						<div class="/20 h-3 w-16 animate-pulse rounded bg-muted-foreground" />
						<div class="/10 h-2 w-20 animate-pulse rounded bg-muted-foreground" />
					</div>
					<div class="/20 h-3 w-3 animate-pulse rounded bg-muted-foreground" />
				</div>
			</Show>

			<Show when={!(session().isPending || session().data)}>
				<A
					class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					href="/login"
				>
					Sign In
				</A>
			</Show>

			<Show when={!session().isPending && session().data}>
				<button
					aria-controls="user-menu-panel"
					aria-expanded={isMenuOpen()}
					aria-haspopup="menu"
					class="flex items-center gap-2 rounded-md border bg-foreground px-3 py-2 text-sm ring-offset-foreground transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
					onClick={toggleMenu}
					type="button"
				>
					<div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
						{getInitial()}
					</div>
					<span class="hidden max-w-[8rem] truncate sm:block">
						{getName()}
					</span>
					<svg
						aria-hidden="true"
						class={`${isMenuOpen() ? 'rotate-180' : ''} h-3 w-3 text-muted-foreground transition-transform duration-150 ease-out`}
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
							fill-rule="evenodd"
						/>
					</svg>
				</button>

				<Show when={isMenuOpen()}>
					<div
						class="fade-in-0 zoom-in-95 absolute right-0 z-50 mt-2 w-72 origin-top-right animate-in rounded-md border bg-popover p-1 text-popover-foreground shadow-md duration-150"
						id="user-menu-panel"
					>
						<div class="slide-in-from-top-1 flex animate-in items-center gap-3 rounded-sm px-2 py-3 duration-150">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
								{getInitial()}
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate font-medium text-sm">
									{getName()}
								</div>
								<div class="truncate text-muted-foreground text-xs">
									{session().data?.user.email}
								</div>
							</div>
						</div>

						<div class="my-1 h-px bg-border" />

						<div class="space-y-1">
							{menuItems.map((item, index) => (
								<a
									class="slide-in-from-left-1 flex animate-in items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
									href={item.href}
									key={index}
									style={`animation-delay: ${(index + 1) * 50}ms`}
								>
									<item.icon class="h-4 w-4" />
									{item.label}
								</a>
							))}
						</div>

						<div class="my-1 h-px bg-border" />

						<button
							class="slide-in-from-left-1 flex w-full animate-in items-center justify-between rounded-sm px-2 py-1.5 text-destructive text-sm transition-colors duration-150 hover:bg-destructive/10"
							onClick={handleSignOut}
							style={`animation-delay: ${(menuItems.length + 2) * 50}ms`}
							type="button"
						>
							<div class="flex items-center gap-2">
								<LogOut class="h-4 w-4" />
								<span>Sign Out</span>
							</div>
							<kbd class="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-destructive/30 bg-destructive/20 px-2 font-mono text-destructive text-xs">
								⇧L
							</kbd>
						</button>
					</div>
				</Show>
			</Show>
		</div>
	);
}
