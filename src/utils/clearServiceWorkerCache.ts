/**
 * Utility to clear service worker cache and force fresh content
 * This helps when old cached code is causing issues
 */
export async function clearServiceWorkerCache(): Promise<void> {
	if (!('serviceWorker' in navigator) || !('caches' in window)) {
		return;
	}

	try {
		// Unregister all service workers
		const registrations = await navigator.serviceWorker.getRegistrations();
		await Promise.all(registrations.map((registration) => registration.unregister()));

		// Clear all caches
		const cacheNames = await caches.keys();
		await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

		console.log('[Cache] Service worker cache cleared');
	} catch (error) {
		console.error('[Cache] Failed to clear service worker cache:', error);
	}
}

/**
 * Clear localStorage items related to service worker updates
 */
export function clearServiceWorkerStorage(): void {
	try {
		localStorage.removeItem('sw-update-prompted-version');
		console.log('[Cache] Service worker storage cleared');
	} catch (error) {
		console.error('[Cache] Failed to clear service worker storage:', error);
	}
}

