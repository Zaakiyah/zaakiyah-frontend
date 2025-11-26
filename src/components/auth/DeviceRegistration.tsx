import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { deviceService } from '../../services/deviceService';
import api from '../../lib/api';

/**
 * Component to handle device registration for authenticated users
 * Registers device when user is logged in and device token is available
 */
export default function DeviceRegistration() {
	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}

		const registerDevice = async () => {
			try {
				const deviceInfo = await deviceService.getDeviceInfo();

				// Only register if we have a device token
				if (deviceInfo.deviceToken) {
					await api.post('/devices', {
						deviceToken: deviceInfo.deviceToken,
						deviceType: deviceInfo.deviceType,
						deviceId: deviceInfo.deviceId,
					});
				}
			} catch (error) {
				// Silently fail - device registration is optional
				console.warn('Failed to register device:', error);
			}
		};

		registerDevice();
	}, [isAuthenticated]);

	return null;
}
