import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initializeFirebase } from './lib/firebase';
import { useThemeStore, applyTheme } from './store/themeStore';
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
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
);
