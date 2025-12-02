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
	const [requires2FA, setRequires2FA] = useState(false);
	const [tempToken, setTempToken] = useState<string | null>(null);
	const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
	const [emailCodeSent, setEmailCodeSent] = useState(false);

	const handleLogin = async (data: LoginFormData) => {
		setIsLoading(true);
		setError(null);
		setRequires2FA(false);

		try {
			// Ensure rememberMe is always a boolean (default to false if undefined)
			const loginData = {
				...data,
				rememberMe: data.rememberMe ?? false,
			};
			const response = await authService.login(loginData);

			// Check if 2FA is required
			if (response.data.requires2FA && response.data.tempToken) {
				setRequires2FA(true);
				setTempToken(response.data.tempToken);
				setTwoFactorMethod(response.data.method || null);
				setEmailCodeSent(response.data.emailCodeSent || false);
				return;
			}

			// Normal login flow
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

	const handleVerify2FA = async (code: string) => {
		if (!tempToken) {
			setError('Missing temporary token. Please try logging in again.');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await authService.verifyLogin2FA(tempToken, code);
			setAuth(response.data.user, response.data.accessToken);
			navigate('/dashboard');
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.message ||
				'Invalid verification code. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel2FA = () => {
		setRequires2FA(false);
		setTempToken(null);
		setTwoFactorMethod(null);
		setEmailCodeSent(false);
		setError(null);
	};

	return {
		isLoading,
		error,
		setError,
		handleLogin,
		requires2FA,
		tempToken,
		twoFactorMethod,
		emailCodeSent,
		handleVerify2FA,
		handleCancel2FA,
	};
}
