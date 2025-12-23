import { useState, useEffect, useRef } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';

const PROMPTED_WORKER_KEY = 'sw-prompted-worker-id';
const UPDATE_CHECK_INTERVAL = 60000; // 60 seconds

// Get a unique ID for the worker (using its script URL)
// We use just the script URL because the state changes, but the URL is unique per version
const getWorkerId = (worker: ServiceWorker): string => {
	return worker.scriptURL;
};

export default function ServiceWorkerUpdate() {
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
	const isRefreshingRef = useRef(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (!('serviceWorker' in navigator)) return;

		// Check if we've already prompted for this specific worker
		const hasPromptedForWorker = (worker: ServiceWorker): boolean => {
			const workerId = getWorkerId(worker);
			const promptedId = localStorage.getItem(PROMPTED_WORKER_KEY);
			return promptedId === workerId;
		};

		// Mark that we've prompted for this worker
		const markPrompted = (worker: ServiceWorker) => {
			const workerId = getWorkerId(worker);
			localStorage.setItem(PROMPTED_WORKER_KEY, workerId);
		};

		// Show prompt for a new worker (only if we haven't prompted for it)
		const showPromptForWorker = (worker: ServiceWorker) => {
			if (hasPromptedForWorker(worker)) {
				return; // Already prompted for this worker
			}

			setWaitingWorker(worker);
			setShowUpdateDialog(true);
			markPrompted(worker);
		};

		// Handle controller change - reload when new service worker takes control
		// Use a flag to prevent multiple reloads
		let hasReloaded = false;
		const handleControllerChange = () => {
			if (hasReloaded || isRefreshingRef.current) return;

			hasReloaded = true;
			isRefreshingRef.current = true;

			// Mark that we've completed the update for this worker
			// This prevents the prompt from showing again after reload
			if (waitingWorker) {
				const workerId = getWorkerId(waitingWorker);
				// Store with a timestamp to mark it as "updated"
				localStorage.setItem(PROMPTED_WORKER_KEY, `${workerId}-updated`);
			}

			// Use a small delay to ensure the new service worker is ready
			setTimeout(() => {
				window.location.reload();
			}, 100);
		};

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

		// Set up service worker registration and update detection
		navigator.serviceWorker.ready.then((registration) => {
			// Check if there's a waiting worker on initial load
			// But only if we haven't already updated it
			if (registration.waiting && navigator.serviceWorker.controller) {
				const workerId = getWorkerId(registration.waiting);
				const promptedId = localStorage.getItem(PROMPTED_WORKER_KEY);

				// Only show if we haven't prompted AND haven't updated this worker
				if (promptedId !== workerId && !promptedId?.endsWith('-updated')) {
					showPromptForWorker(registration.waiting);
				}
			}

			// ONLY listen for NEW updates being found (updatefound event)
			// This is the ONLY reliable way to detect when a new update is available
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (!newWorker) return;

				// Track the new worker's state changes
				const handleStateChange = () => {
					// When the new worker is installed AND there's an active controller,
					// it means there's a new version waiting to activate
					if (
						newWorker.state === 'installed' &&
						navigator.serviceWorker.controller &&
						!isRefreshingRef.current &&
						!hasPromptedForWorker(newWorker)
					) {
						// Check if this worker was already updated
						const promptedId = localStorage.getItem(PROMPTED_WORKER_KEY);
						if (!promptedId?.endsWith('-updated')) {
							// This is a NEW update - show prompt
							showPromptForWorker(newWorker);
						}
					}
				};

				// Remove old listener if any and add new one
				newWorker.removeEventListener('statechange', handleStateChange);
				newWorker.addEventListener('statechange', handleStateChange);
			});

			// Check for updates periodically (only in production)
			// This will trigger 'updatefound' if a new version is available
			if (import.meta.env.PROD) {
				intervalRef.current = setInterval(() => {
					registration.update().catch(() => {
						// Silently fail if update check fails
					});
				}, UPDATE_CHECK_INTERVAL);
			}
		});

		return () => {
			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const handleUpdate = () => {
		if (!waitingWorker || isRefreshingRef.current) return;

		isRefreshingRef.current = true;
		setShowUpdateDialog(false);

		// Mark this worker as being updated to prevent prompt after reload
		const workerId = getWorkerId(waitingWorker);
		localStorage.setItem(PROMPTED_WORKER_KEY, `${workerId}-updating`);

		// Tell the waiting worker to skip waiting and activate immediately
		waitingWorker.postMessage({ type: 'SKIP_WAITING' });

		// Fallback: if controllerchange doesn't fire within 2 seconds, reload manually
		setTimeout(() => {
			if (isRefreshingRef.current) {
				// Mark as updated
				localStorage.setItem(PROMPTED_WORKER_KEY, `${workerId}-updated`);
				window.location.reload();
			}
		}, 2000);
	};

	const handleCancel = () => {
		setShowUpdateDialog(false);
		// Keep the worker ID in localStorage so we don't prompt again for this update
		// User can manually reload later if they want
	};

	return (
		<ConfirmDialog
			isOpen={showUpdateDialog}
			onClose={handleCancel}
			onConfirm={handleUpdate}
			title="Update Available"
			message="A new version of Zaakiyah is available. Would you like to update now? The app will reload to apply the update."
			confirmText="Update Now"
			cancelText="Later"
			variant="info"
			confirmVariant="primary"
		/>
	);
}
