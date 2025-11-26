// Firebase Service Worker for Background Push Notifications
// This file must be in the public folder

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config will be passed from the main app
let firebaseConfig = null;

// Listen for config from main app
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'FIREBASE_CONFIG') {
		firebaseConfig = event.data.config;
		if (firebaseConfig) {
			initializeFirebase();
		}
	}
});

function initializeFirebase() {
	if (!firebaseConfig) {
		console.error('[SW] Firebase config not received');
		return;
	}

	try {
		firebase.initializeApp(firebaseConfig);
		const messaging = firebase.messaging();

		// Handle background messages
		messaging.onBackgroundMessage((payload) => {
			console.log('[SW] Received background message', payload);

			const notificationTitle = payload.notification?.title || 'New Notification';
			const notificationOptions = {
				body: payload.notification?.body || payload.data?.message || '',
				icon: payload.notification?.icon || '/vite.svg',
				badge: '/vite.svg',
				data: payload.data || {},
			};

			self.registration.showNotification(notificationTitle, notificationOptions);
		});
	} catch (error) {
		console.error('[SW] Error initializing Firebase:', error);
	}
}
