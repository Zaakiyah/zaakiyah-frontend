/**
 * Website configuration
 * Uses environment variables for flexibility across different environments
 */

// Get website URL from environment variable
// Default to production URL if not set
export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://zaakiyah.com';

// Website page paths
export const WEBSITE_PAGES = {
	HOME: WEBSITE_URL,
	BLOG: `${WEBSITE_URL}/blog`,
	HELP: `${WEBSITE_URL}/help`,
	TERMS: `${WEBSITE_URL}/terms`,
	PRIVACY: `${WEBSITE_URL}/privacy`,
	ABOUT: `${WEBSITE_URL}/about`,
} as const;
