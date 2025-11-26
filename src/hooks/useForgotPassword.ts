import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { ForgotPasswordFormData } from '../types/auth.types';

export function useForgotPassword() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleForgotPassword = async (data: ForgotPasswordFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			await authService.forgotPassword(data.email);
			// Navigate to reset password page with email as query parameter
			navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
		} catch (err: any) {
			setError(
				err.response?.data?.message || 'Failed to send reset code. Please try again.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		error,
		setError,
		handleForgotPassword,
	};
}

