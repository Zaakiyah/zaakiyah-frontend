import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { LoginFormData } from '../types/auth.types';

export function useLogin() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async (data: LoginFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			// Ensure rememberMe is always a boolean (default to false if undefined)
			const loginData = {
				...data,
				rememberMe: data.rememberMe ?? false,
			};
			const response = await authService.login(loginData);
			setAuth(response.data.user, response.data.accessToken);
			navigate('/dashboard');
		} catch (err: any) {
			// Extract error message from API response
			// Backend returns: { statusCode, error, message }
			const errorMessage =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.message ||
				'Invalid login credentials. Please try again.';

			// Map common error messages to user-friendly ones
			const friendlyMessage =
				errorMessage.toLowerCase().includes('invalid credentials') ||
				errorMessage.toLowerCase().includes('unauthorized')
					? 'Invalid email or password. Please try again.'
					: errorMessage;

			setError(friendlyMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		error,
		setError,
		handleLogin,
	};
}
