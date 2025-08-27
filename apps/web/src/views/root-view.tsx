import type { ParentProps } from 'solid-js';
import Header from '@/components/header';

type TProps = ParentProps;

export default function RootView(props: TProps) {
	return (
		<div class="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			<div class="flex flex-col items-center justify-center">
				{props.children}
			</div>
		</div>
	);
}
