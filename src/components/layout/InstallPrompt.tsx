import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		// Check if app is already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			setIsInstalled(true);
			return;
		}

		// Check if user has dismissed the prompt before (stored in localStorage)
		const wasDismissed = localStorage.getItem('pwa-install-dismissed');
		if (wasDismissed === 'true') {
			setDismissed(true);
			return;
		}

		// Listen for the beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			// Show prompt after a delay (e.g., 3 seconds)
			setTimeout(() => {
				setShowPrompt(true);
			}, 3000);
			// Suppress the browser's default install banner message
			console.log('[PWA] Install prompt intercepted. Custom prompt will show shortly.');
		};

		// Listen for app installed event
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setShowPrompt(false);
			setDeferredPrompt(null);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		// Show the install prompt
		await deferredPrompt.prompt();

		// Wait for the user to respond
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('User accepted the install prompt');
		} else {
			console.log('User dismissed the install prompt');
		}

		// Clear the deferred prompt
		setDeferredPrompt(null);
		setShowPrompt(false);
	};

	const handleDismiss = () => {
		setShowPrompt(false);
		setDismissed(true);
		// Remember that user dismissed the prompt
		localStorage.setItem('pwa-install-dismissed', 'true');
		// Show again after 7 days
		setTimeout(() => {
			localStorage.removeItem('pwa-install-dismissed');
		}, 7 * 24 * 60 * 60 * 1000);
	};

	// Don't show if already installed or dismissed
	if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
		return null;
	}

	return (
		<AnimatePresence>
			{showPrompt && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
				>
					<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 shadow-2xl border-2 border-primary-500/20 dark:border-primary-400/20">
						<div className="flex items-start gap-3">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
									<ArrowDownTrayIcon className="w-6 h-6 text-white" />
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
									Install Zaakiyah
								</h3>
								<p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
									Install our app for a better experience. Get quick access and
									work offline.
								</p>
								<div className="flex items-center gap-2">
									<button
										onClick={handleInstallClick}
										className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-500/30"
									>
										Install
									</button>
									<button
										onClick={handleDismiss}
										className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
										aria-label="Dismiss"
									>
										<XMarkIcon className="w-5 h-5" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
