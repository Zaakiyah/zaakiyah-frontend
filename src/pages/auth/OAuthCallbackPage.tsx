import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import { authService } from '../../services/authService';
import OtpInput from '../../components/ui/OtpInput';
import Button from '../../components/ui/Button';
import type { User } from '../../services/authService';
import { TwoFactorMethod } from '../../services/twoFactorService';

export default function OAuthCallbackPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isVerifying2FA, setIsVerifying2FA] = useState(false);
	const token = searchParams.get('token');
	const errorParam = searchParams.get('error');
	const requires2FA = searchParams.get('2fa') === 'true';
	const tempToken = searchParams.get('tempToken');
	const method = searchParams.get('method');

	useEffect(() => {
		// Handle 2FA required for OAuth
		if (requires2FA && tempToken) {
			setIsLoading(false);
			return;
		}

		if (errorParam) {
			setIsLoading(false);
			setTimeout(() => {
				navigate('/login?error=oauth_failed', { replace: true });
			}, 3000);
			return;
		}

		if (token) {
			const authenticateUser = async () => {
				try {
					localStorage.setItem('accessToken', token);

					const response = await api.get<{
						message: string;
						statusCode: number;
						data: User;
					}>('/me');

					setAuth(response.data.data, token);
					navigate('/dashboard', { replace: true });
				} catch (err: any) {
					console.error('OAuth callback error:', err);
					localStorage.removeItem('accessToken');
					navigate('/login?error=oauth_failed', { replace: true });
				} finally {
					setIsLoading(false);
				}
			};

			authenticateUser();
		} else if (!requires2FA) {
			setIsLoading(false);
			navigate('/login', { replace: true });
		}
	}, [token, errorParam, requires2FA, tempToken, navigate, setAuth]);

	const handleVerify2FA = async (code: string) => {
		if (!tempToken) {
			setError('Missing temporary token. Please try logging in again.');
			return;
		}

		setIsVerifying2FA(true);
		setError(null);

		try {
			const response = await authService.verifyLogin2FA(tempToken, code);
			setAuth(response.data.user, response.data.accessToken);
			navigate('/dashboard', { replace: true });
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.message ||
				'Invalid verification code. Please try again.';
			setError(errorMessage);
		} finally {
			setIsVerifying2FA(false);
		}
	};

	const handleCancel2FA = () => {
		navigate('/login', { replace: true });
	};

	// Show 2FA verification UI if required
	if (requires2FA && tempToken) {
		return (
			<div className="h-screen-vh bg-slate-50 flex items-center justify-center px-4 py-2 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 my-auto"
				>
					{/* Header */}
					<div className="text-center mb-6">
						<div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
							<LockClosedIcon className="w-8 h-8 text-primary-600" />
						</div>
						<h1 className="text-2xl font-bold text-slate-900 mb-1.5">
							Two-Factor Authentication
						</h1>
						<p className="text-sm text-slate-600">
							{method === TwoFactorMethod.EMAIL
								? 'We sent a 6-digit code to your email. Please enter it below.'
								: 'Enter the 6-digit code from your authenticator app.'}
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg"
						>
							<p className="text-sm text-error-600">{error}</p>
						</motion.div>
					)}

					{/* 2FA Code Input */}
					<div className="mb-6">
						<OtpInput
							length={6}
							onComplete={handleVerify2FA}
							disabled={isVerifying2FA}
							autoFocus={true}
							error={error || undefined}
						/>
					</div>

					{/* Back Button */}
					<Button
						type="button"
						variant="outline"
						size="lg"
						onClick={handleCancel2FA}
						disabled={isVerifying2FA}
						className="w-full flex items-center justify-center gap-2"
					>
						<ArrowLeftIcon className="w-5 h-5" />
						Back to Login
					</Button>
				</motion.div>
			</div>
		);
	}

	if (errorParam || (!token && !isLoading && !requires2FA)) {
		return (
			<div className="h-screen-vh bg-slate-50 flex items-center justify-center px-4 py-2 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 text-center my-auto"
				>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
						className="mx-auto w-14 h-14 bg-error-50 rounded-full flex items-center justify-center mb-4"
					>
						<ExclamationCircleIcon className="w-8 h-8 text-error-600" />
					</motion.div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">
						Authentication Failed
					</h2>
					<p className="text-sm text-slate-600 mb-4">
						{errorParam === 'access_denied'
							? 'You cancelled the authentication process.'
							: errorParam && decodeURIComponent(errorParam) !== 'access_denied'
								? decodeURIComponent(errorParam)
								: 'An error occurred during authentication. Please try again.'}
					</p>
					<p className="text-xs text-slate-500">
						Redirecting to login page...
					</p>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="h-screen-vh bg-slate-50 flex items-center justify-center px-4 py-2 overflow-y-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 text-center"
			>
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
					className="mx-auto w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-4"
				>
					<CheckCircleIcon className="w-8 h-8 text-primary-600" />
				</motion.div>
				<h2 className="text-xl font-bold text-slate-900 mb-2">
					Authentication Successful
				</h2>
				<p className="text-sm text-slate-600 mb-4">Completing your login...</p>
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-7 w-7 border-2 border-primary-600 border-t-transparent"></div>
				</div>
			</motion.div>
		</div>
	);
}
