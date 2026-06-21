import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';
import { logger } from '../utils/logger';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase app (only once)
 */
export function initializeFirebase(): FirebaseApp | null {
	if (typeof window === 'undefined') {
		return null;
	}

	// Check if Firebase is already initialized
	if (getApps().length > 0) {
		app = getApps()[0];
		return app;
	}

	// Validate config - check if all required values are present
	const hasValidConfig =
		firebaseConfig.apiKey &&
		firebaseConfig.projectId &&
		firebaseConfig.authDomain &&
		firebaseConfig.messagingSenderId &&
		firebaseConfig.appId;

	if (!hasValidConfig) {
		logger.warn(
			'Firebase config is missing or incomplete. Push notifications will be disabled.'
		);
		logger.warn('Please add Firebase configuration to your .env file.');
		return null;
	}

	try {
		app = initializeApp(firebaseConfig);
		return app;
	} catch (error) {
		logger.error('Error initializing Firebase:', error);
		return null;
	}
}

/**
 * Get Firebase Messaging instance
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') {
		return null;
	}

	if (!('serviceWorker' in navigator)) {
		logger.warn('Service workers are not supported. Push notifications will be disabled.');
		return null;
	}

	if (messaging) {
		return messaging;
	}

	const firebaseApp = initializeFirebase();
	if (!firebaseApp) {
		return null;
	}

	try {
		// Register service worker and pass config
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register(
					'/firebase-messaging-sw.js',
					{
						scope: '/',
					}
				);

				// Wait for service worker to be ready
				await navigator.serviceWorker.ready;

				// Send Firebase config to service worker
				if (registration.active) {
					registration.active.postMessage({
						type: 'FIREBASE_CONFIG',
						config: firebaseConfig,
					});
				}
			} catch (swError) {
				logger.warn('Service worker registration failed:', swError);
			}
		}

		messaging = getMessaging(firebaseApp);
		return messaging;
	} catch (error) {
		logger.error('Error getting Firebase Messaging:', error);
		return null;
	}
}

/**
 * Get FCM token for push notifications
 */
export async function getFCMToken(): Promise<string | null> {
	const messagingInstance = await getFirebaseMessaging();
	if (!messagingInstance) {
		return null;
	}

	const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
	if (!vapidKey) {
		logger.warn('VAPID key is missing. Push notifications will be disabled.');
		return null;
	}

	try {
		const token = await getToken(messagingInstance, {
			vapidKey,
		});

		if (token) {
			// Token obtained successfully
			return token;
		} else {
			// No token available - user needs to grant permission
			return null;
		}
	} catch (error) {
		logger.error('Error getting FCM token:', error);
		return null;
	}
}

/**
 * Set up message handler for foreground notifications
 */
export async function onMessageListener(): Promise<any> {
	return new Promise(async (resolve) => {
		const messagingInstance = await getFirebaseMessaging();
		if (!messagingInstance) {
			resolve(null);
			return;
		}

		onMessage(messagingInstance, (payload) => {
			// Message received in foreground
			resolve(payload);
		});
	});
}
