import { A } from '@solidjs/router';
import { For } from 'solid-js';
import { UserDropdown } from './dropdown-menu';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/connections', label: 'Connections' },
		{ href: '/todos', label: 'Todos' },
	];

	return (
		<div>
			<div class="flex flex-row items-center justify-between px-2 py-1">
				<nav class="flex gap-4 text-lg">
					<For each={links}>
						{(link) => <A href={link.href}>{link.label}</A>}
					</For>
				</nav>
				<div class="flex items-center gap-2">
					<ThemeToggle />
					<UserDropdown />
				</div>
			</div>
			<hr />
		</div>
	);
}
