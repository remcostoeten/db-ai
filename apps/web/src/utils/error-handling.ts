/**
 * Centralized error handling utilities
 */

export type TApiError = {
	message: string;
	code?: string;
	status?: number;
};

/**
 * Extract a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	
	if (typeof error === 'string') {
		return error;
	}
	
	if (error && typeof error === 'object' && 'message' in error) {
		return String(error.message);
	}
	
	return 'An unexpected error occurred';
}

/**
 * Check if an error is a network/connectivity error
 */
export function isNetworkError(error: unknown): boolean {
	const message = getErrorMessage(error).toLowerCase();
	return message.includes('network') || 
		   message.includes('fetch') || 
		   message.includes('connection') ||
		   message.includes('timeout');
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
	const message = getErrorMessage(error).toLowerCase();
	return message.includes('unauthorized') || 
		   message.includes('authentication') ||
		   message.includes('login');
}

/**
 * Check if an error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
	const message = getErrorMessage(error).toLowerCase();
	return message.includes('forbidden') || 
		   message.includes('permission') ||
		   message.includes('access denied');
}

/**
 * Global error handler for ORPC errors
 */
export function handleApiError(error: unknown, context?: string) {
	const message = getErrorMessage(error);
	const contextMessage = context ? `[${context}] ` : '';
	
	console.error(`${contextMessage}API Error:`, message);
	
	// You could integrate with a toast/notification system here
	// toast.error(message);
	
	// You could also integrate with error tracking services here
	// Sentry.captureException(error);
}