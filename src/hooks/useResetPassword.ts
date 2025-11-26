import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { ResetPasswordFormData } from '../types/auth.types';

export function useResetPassword() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleResetPassword = async (data: ResetPasswordFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			await authService.resetPassword(
				data.email,
				data.otpCode,
				data.password,
				data.confirmPassword
			);
			setSuccess(true);
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		error,
		success,
		setError,
		handleResetPassword,
	};
}

