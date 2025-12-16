const isDevelopment = import.meta.env.DEV;

/**
 * Logger utility for consistent logging across the application
 * - Errors: Always logged (important for production error tracking)
 * - Warnings: Always logged (important for production debugging)
 * - Logs/Debug: Only in development mode
 */
export const logger = {
	log: (...args: any[]) => {
		if (isDevelopment) {
			console.log(...args);
		}
	},
	error: (...args: any[]) => {
		// Always log errors for production error tracking
		console.error(...args);
	},
	warn: (...args: any[]) => {
		// Always log warnings for production debugging
		console.warn(...args);
	},
	debug: (...args: any[]) => {
		if (isDevelopment) {
			console.debug(...args);
		}
	},
};
