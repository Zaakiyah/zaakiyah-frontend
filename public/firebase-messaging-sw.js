// Firebase Service Worker for Background Push Notifications
// This file must be in the public folder

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config - try to get from environment or wait for message
let firebaseConfig = null;
let firebaseInitialized = false;

// Try to initialize immediately if config is available
// Note: Service workers can't access import.meta.env directly, so we'll wait for message
// or use a different approach

// Listen for config from main app
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'FIREBASE_CONFIG') {
		firebaseConfig = event.data.config;
		if (firebaseConfig && !firebaseInitialized) {
			initializeFirebase();
		}
	}
});

// Also try to initialize on service worker activation
self.addEventListener('activate', () => {
	console.log('[SW] Service worker activated');
	// If we have config, initialize
	if (firebaseConfig && !firebaseInitialized) {
		initializeFirebase();
	}
});

function initializeFirebase() {
	if (!firebaseConfig) {
		console.error('[SW] Firebase config not available');
		return;
	}

	if (firebaseInitialized) {
		console.log('[SW] Firebase already initialized');
		return;
	}

	try {
		firebase.initializeApp(firebaseConfig);
		const messaging = firebase.messaging();
		firebaseInitialized = true;

		console.log('[SW] Firebase initialized successfully');

		// Handle background messages
		messaging.onBackgroundMessage((payload) => {
			console.log('[SW] Received background message', payload);

			const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
			const notificationBody = payload.notification?.body || payload.data?.message || payload.message || '';
			const notificationOptions = {
				body: notificationBody,
				icon: payload.notification?.icon || '/vite.svg',
				badge: '/vite.svg',
				data: payload.data || {},
				tag: payload.data?.type || 'notification',
				requireInteraction: false,
			};

			return self.registration.showNotification(notificationTitle, notificationOptions);
		});

		console.log('[SW] Background message handler registered');
	} catch (error) {
		console.error('[SW] Error initializing Firebase:', error);
		firebaseInitialized = false;
	}
}
