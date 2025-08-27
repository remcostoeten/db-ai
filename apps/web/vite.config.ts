import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss(), cloudflare()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@shared': path.resolve(__dirname, '../../shared'),
			'utilities': path.resolve(__dirname, './src/shared/utilities/index.ts'),
			'ui': path.resolve(__dirname, './src/shared/components/ui/index.ts'),
		},
	},
});
