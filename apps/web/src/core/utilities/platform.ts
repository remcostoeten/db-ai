export function isTauri(): boolean {
	return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
}

export function isBrowser(): boolean {
	return typeof window !== 'undefined' && window.__TAURI__ === undefined;
}

export function getAuthBaseURL(): string {
	if (isTauri()) {
		return import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
	}

	// Production: Use deployed Workers URL, fallback to localhost for development
	return import.meta.env.VITE_SERVER_URL || 'https://db-palace-server.your-subdomain.workers.dev';
}

export function getAPIBaseURL(): string {
	if (isTauri()) {
		return import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
	}

	// Production: Use deployed Workers URL, fallback to localhost for development
	return import.meta.env.VITE_SERVER_URL || 'https://db-palace-server.your-subdomain.workers.dev';
}

export type TPlatform = 'tauri' | 'browser';

export function getPlatform(): TPlatform {
	return isTauri() ? 'tauri' : 'browser';
}
