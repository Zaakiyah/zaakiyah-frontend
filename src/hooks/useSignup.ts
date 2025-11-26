import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { SignupFormData } from '../types/auth.types';

export function useSignup() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [step, setStep] = useState<
		'email' | 'verify' | 'basicInfo' | 'avatar' | 'pin' | 'preferences'
	>('email');
	const [email, setEmail] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSendCode = async () => {
		if (!email) {
			setError('Please enter your email address');
			return;
		}

		// Use isSendingCode when already on verify step, otherwise use isLoading
		if (step === 'verify') {
			setIsSendingCode(true);
		} else {
			setIsLoading(true);
		}
		setError(null);

		try {
			await authService.sendSignupCode(email);
			// Only set step if we're on email step
			if (step === 'email') {
				setStep('verify');
			}
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to send verification code');
		} finally {
			if (step === 'verify') {
				setIsSendingCode(false);
			} else {
				setIsLoading(false);
			}
		}
	};

	const handleVerifyCode = async (code?: string) => {
		const codeToVerify = code || verificationCode;
		if (!codeToVerify || codeToVerify.length !== 6) {
			setError('Please enter the 6-digit verification code');
			return;
		}

		setIsLoading(true);
		setError(null);
		
		// Update state with the code if provided
		if (code) {
			setVerificationCode(code);
		}

		try {
			await authService.verifySignupCode(email, codeToVerify);
			setStep('basicInfo');
		} catch (err: any) {
			setError(err.response?.data?.message || 'Invalid verification code');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignup = async (data: SignupFormData, preferences: string[], avatarId?: string) => {
		if (preferences.length === 0) {
			setError('Please select at least one preference');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const signupData = {
				...data,
				email,
				preferences,
				avatarId,
			};

			const response = await authService.signup(signupData);
			setAuth(response.data.user, response.data.accessToken);
			navigate('/dashboard');
		} catch (err: any) {
			console.error('Signup error:', err);
			setError(err.response?.data?.message || 'Signup failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return {
		step,
		setStep,
		email,
		setEmail,
		verificationCode,
		setVerificationCode,
		isLoading,
		isSendingCode,
		error,
		setError,
		handleSendCode,
		handleVerifyCode,
		handleSignup,
	};
}
