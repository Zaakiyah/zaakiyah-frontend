interface DeviceInfo {
	deviceToken?: string;
	deviceType: string;
	deviceId?: string;
}

class DeviceService {
	private deviceInfo: DeviceInfo | null = null;
	private deviceTokenPromise: Promise<string | null> | null = null;

	/**
	 * Get device type (web, ios, android)
	 */
	getDeviceType(): string {
		return 'web';
	}

	/**
	 * Get device identifier
	 */
	getDeviceId(): string {
		if (typeof navigator !== 'undefined') {
			const userAgent = navigator.userAgent;
			const platform = navigator.platform;
			return `${platform}-${userAgent.slice(0, 50)}`;
		}
		return 'unknown';
	}

	/**
	 * Request notification permission and get FCM token
	 */
	async getDeviceToken(): Promise<string | null> {
		if (this.deviceTokenPromise) {
			return this.deviceTokenPromise;
		}

		this.deviceTokenPromise = (async () => {
			try {
				if (typeof window === 'undefined' || !('Notification' in window)) {
					return null;
				}

				// Request notification permission
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					console.log('Notification permission denied');
					return null;
				}

				// Get FCM token from Firebase
				try {
					const { getFCMToken } = await import('../lib/firebase');
					const token = await getFCMToken();
					return token;
				} catch (firebaseError) {
					// If Firebase is not configured, return null gracefully
					console.warn('Firebase not configured or error getting token:', firebaseError);
					return null;
				}
			} catch (error) {
				console.error('Error getting device token:', error);
				return null;
			}
		})();

		return this.deviceTokenPromise;
	}

	/**
	 * Get complete device info
	 */
	async getDeviceInfo(): Promise<DeviceInfo> {
		if (this.deviceInfo) {
			return this.deviceInfo;
		}

		const deviceToken = await this.getDeviceToken();

		this.deviceInfo = {
			deviceToken: deviceToken || undefined,
			deviceType: this.getDeviceType(),
			deviceId: this.getDeviceId(),
		};

		return this.deviceInfo;
	}

	/**
	 * Clear cached device info (useful for logout)
	 */
	clearDeviceInfo(): void {
		this.deviceInfo = null;
		this.deviceTokenPromise = null;
	}

	/**
	 * Check if device info is available
	 */
	hasDeviceInfo(): boolean {
		return this.deviceInfo !== null;
	}
}

export const deviceService = new DeviceService();
