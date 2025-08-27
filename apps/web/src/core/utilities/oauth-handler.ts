import { isTauri } from './platform';

type TOAuthProvider = 'github' | 'google' | 'discord';

export function handleOAuthRedirect(
	provider: TOAuthProvider,
	redirectUrl: string
) {
	if (isTauri()) {
		return handleTauriOAuthRedirect(provider, redirectUrl);
	}

	return handleBrowserOAuthRedirect(redirectUrl);
}

function handleTauriOAuthRedirect(
	_provider: TOAuthProvider,
	redirectUrl: string
) {
	if (typeof window !== 'undefined' && window.__TAURI__) {
		const { shell } = window.__TAURI__;
		return shell.open(redirectUrl);
	}

	window.location.href = redirectUrl;
}

function handleBrowserOAuthRedirect(redirectUrl: string) {
	window.location.href = redirectUrl;
}

export function extractTokenFromUrl(url: string): string | null {
	const urlParams = new URLSearchParams(new URL(url).search);
	return urlParams.get('token') || urlParams.get('code');
}

export function isOAuthCallback(url: string): boolean {
	return (
		url.includes('/auth/callback') ||
		url.includes('code=') ||
		url.includes('token=')
	);
}
