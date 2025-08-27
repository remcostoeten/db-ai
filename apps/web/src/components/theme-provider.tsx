import { useColorMode } from '@kobalte/core';
import { createEffect } from 'solid-js';

type TProps = {
	children: any;
};

export default function ThemeProvider(props: TProps) {
	const { colorMode } = useColorMode();

	createEffect(() => {
		const root = document.documentElement;
		if (colorMode() === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	});

	return props.children;
}
