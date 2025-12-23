import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initializeFirebase } from './lib/firebase';
import { useThemeStore, applyTheme } from './store/themeStore';
import { clearServiceWorkerStorage } from './utils/clearServiceWorkerCache';
import './index.css';
import App from './App.tsx';

// Initialize Firebase on app startup
if (typeof window !== 'undefined') {
	initializeFirebase();

	// Initialize theme after a short delay to ensure store is rehydrated
	// The ThemeProvider will also apply the theme, but this prevents FOUC
	setTimeout(() => {
		const theme = useThemeStore.getState().theme;
		applyTheme(theme);
	}, 100);
}

// Mobile fullscreen support - Set viewport height to handle mobile browser UI
if (typeof window !== 'undefined') {
	const setViewportHeight = () => {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	};

	// Set initial height
	setViewportHeight();

	// Update on resize and orientation change
	window.addEventListener('resize', setViewportHeight);
	window.addEventListener('orientationchange', () => {
		setTimeout(setViewportHeight, 100);
	});

	// Prevent zoom on double tap (iOS)
	let lastTouchEnd = 0;
	document.addEventListener(
		'touchend',
		(event) => {
			const now = Date.now();
			if (now - lastTouchEnd <= 300) {
				event.preventDefault();
			}
			lastTouchEnd = now;
		},
		false
	);

	// Hide address bar on scroll (Android)
	let scrollTimeout: ReturnType<typeof setTimeout>;
	window.addEventListener('scroll', () => {
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			window.scrollTo(0, 1);
		}, 100);
	});

	// Initial scroll to hide address bar
	setTimeout(() => {
		window.scrollTo(0, 1);
	}, 100);

	// Register main service worker for PWA
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', async () => {
			try {
				// Clear old service worker storage on load to prevent stale prompts
				clearServiceWorkerStorage();

				// Register main service worker (separate from Firebase messaging worker)
				const registration = await navigator.serviceWorker.register('/sw.js', {
					scope: '/',
					updateViaCache: 'none', // Always fetch fresh service worker
				});

				// Only log in development to reduce console noise
				if (import.meta.env.DEV) {
					console.log('[PWA] Service Worker registered:', registration.scope);
				}

				// Check for updates periodically (only in production)
				if (import.meta.env.PROD) {
					setInterval(() => {
						registration.update().catch(() => {
							// Silently fail if update check fails
						});
					}, 60000);
				}
			} catch (error) {
				console.warn('[PWA] Service Worker registration failed:', error);
			}
		});
	}

	// Prevent any accidental confirm() calls from old cached code
	if (typeof window !== 'undefined') {
		const originalConfirm = window.confirm;
		window.confirm = function (message?: string): boolean {
			// If it's a service worker update message, prevent it and let our component handle it
			if (
				message &&
				(message.includes('new version') ||
					message.includes('reload') ||
					message.includes('update'))
			) {
				console.warn(
					'[PWA] Blocked native confirm dialog for service worker update. Use ServiceWorkerUpdate component instead.'
				);
				return false;
			}
			// For other confirm dialogs, use the original
			return originalConfirm.call(window, message);
		};
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
);
