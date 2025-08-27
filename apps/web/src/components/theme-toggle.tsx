import { useColorMode } from '@kobalte/core';
import { Moon, Sun } from 'lucide-solid';

type TProps = {
	class?: string;
};

export function ThemeToggle(props: TProps) {
	const { colorMode, setColorMode } = useColorMode();

	function toggleTheme() {
		setColorMode(colorMode() === 'light' ? 'dark' : 'light');
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			class={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${props.class || ''}`}
			aria-label="Toggle theme"
		>
			{colorMode() === 'light' ? (
				<Moon class="h-4 w-4" />
			) : (
				<Sun class="h-4 w-4" />
			)}
		</button>
	);
}
