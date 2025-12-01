import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { deviceService } from '../../services/deviceService';
import api from '../../lib/api';

/**
 * Component to handle device registration for authenticated users
 * Registers device when user is logged in and device token is available
 */
export default function DeviceRegistration() {
	const { isAuthenticated } = useAuthStore();
	const hasRegisteredRef = useRef(false);

	useEffect(() => {
		if (!isAuthenticated || hasRegisteredRef.current) {
			return;
		}

		let isMounted = true;
		hasRegisteredRef.current = true;

		const registerDevice = async () => {
			try {
				const deviceInfo = await deviceService.getDeviceInfo();

				// Only register if we have a device token and component is still mounted
				if (isMounted && deviceInfo.deviceToken) {
					await api.post('/devices', {
						deviceToken: deviceInfo.deviceToken,
						deviceType: deviceInfo.deviceType,
						deviceId: deviceInfo.deviceId,
					});
				}
			} catch (error) {
				// Silently fail - device registration is optional
				if (isMounted) {
					console.warn('Failed to register device:', error);
					hasRegisteredRef.current = false; // Allow retry on error
				}
			}
		};

		registerDevice();

		return () => {
			isMounted = false;
		};
	}, [isAuthenticated]);

	return null;
}
