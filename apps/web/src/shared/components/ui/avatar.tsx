import {
	createEffect,
	createSignal,
	type JSX,
	Show,
	splitProps,
} from 'solid-js';
import { cn } from 'utilities';

type TAvatarProps = {
	class?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	children?: JSX.Element;
};

type TAvatarImageProps = {
	src?: string;
	alt?: string;
	class?: string;
	onLoadingStatusChange?: (
		status: 'idle' | 'loading' | 'loaded' | 'error'
	) => void;
} & JSX.ImgHTMLAttributes<HTMLImageElement>;

type TAvatarFallbackProps = {
	class?: string;
	children?: JSX.Element;
	delayMs?: number;
};

function Avatar(props: TAvatarProps) {
	const [local, others] = splitProps(props, ['class', 'size', 'children']);

	const sizeClasses = {
		sm: 'h-8 w-8 text-xs',
		md: 'h-10 w-10 text-sm',
		lg: 'h-12 w-12 text-base',
		xl: 'h-16 w-16 text-lg',
	};

	return (
		<span
			class={cn(
				'relative flex shrink-0 overflow-hidden rounded-full',
				sizeClasses[local.size || 'md'],
				local.class
			)}
			{...others}
		>
			{local.children}
		</span>
	);
}

function AvatarImage(props: TAvatarImageProps) {
	const [local, others] = splitProps(props, [
		'src',
		'alt',
		'class',
		'onLoadingStatusChange',
	]);
	const [imageLoadingStatus, setImageLoadingStatus] = createSignal<
		'idle' | 'loading' | 'loaded' | 'error'
	>('idle');

	createEffect(() => {
		if (!local.src) {
			setImageLoadingStatus('error');
			return;
		}

		setImageLoadingStatus('loading');

		const image = new Image();

		function handleLoad() {
			setImageLoadingStatus('loaded');
		}

		function handleError() {
			setImageLoadingStatus('error');
		}

		image.addEventListener('load', handleLoad);
		image.addEventListener('error', handleError);
		image.src = local.src;

		return () => {
			image.removeEventListener('load', handleLoad);
			image.removeEventListener('error', handleError);
		};
	});

	createEffect(() => {
		local.onLoadingStatusChange?.(imageLoadingStatus());
	});

	return (
		<Show when={imageLoadingStatus() === 'loaded'}>
			<img
				alt={local.alt}
				class={cn(
					'aspect-square h-full w-full object-cover',
					local.class
				)}
				src={local.src}
				{...others}
			/>
		</Show>
	);
}

function AvatarFallback(props: TAvatarFallbackProps) {
	const [local, others] = splitProps(props, ['class', 'children', 'delayMs']);
	const [canRender, setCanRender] = createSignal(local.delayMs === undefined);

	createEffect(() => {
		if (local.delayMs !== undefined) {
			const timer = setTimeout(() => setCanRender(true), local.delayMs);
			return () => clearTimeout(timer);
		}
	});

	return (
		<Show when={canRender()}>
			<span
				class={cn(
					'flex h-full w-full items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300',
					local.class
				)}
				{...others}
			>
				{local.children}
			</span>
		</Show>
	);
}

export { Avatar, AvatarImage, AvatarFallback };
