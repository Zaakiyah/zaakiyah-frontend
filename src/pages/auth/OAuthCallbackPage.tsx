import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import api from '../../lib/api';
import { authService } from '../../services/authService';
import OtpInput from '../../components/ui/OtpInput';
import Button from '../../components/ui/Button';
import type { User } from '../../services/authService';
import { TwoFactorMethod } from '../../services/twoFactorService';

export default function OAuthCallbackPage() {
	useTheme();
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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-8 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative w-full max-w-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 my-auto overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
					
					{/* Header */}
					<div className="text-center mb-6 relative z-10">
						<div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 dark:shadow-primary-600/20">
							<LockClosedIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
						</div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
							Two-Factor Authentication
						</h1>
						<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
							className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl relative z-10"
						>
							<p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
						</motion.div>
					)}

					{/* 2FA Code Input */}
					<div className="mb-6 relative z-10">
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
						className="w-full flex items-center justify-center gap-2 relative z-10"
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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-8 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative w-full max-w-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 text-center my-auto overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/10 via-rose-500/10 to-red-400/5 rounded-full blur-3xl -z-0" />
					
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
						className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/30 dark:to-rose-800/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20 dark:shadow-red-600/20 relative z-10"
					>
						<ExclamationCircleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
					</motion.div>
					<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 relative z-10">
						Authentication Failed
					</h2>
					<p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed relative z-10">
						{errorParam === 'access_denied'
							? 'You cancelled the authentication process.'
							: errorParam && decodeURIComponent(errorParam) !== 'access_denied'
								? decodeURIComponent(errorParam)
								: 'An error occurred during authentication. Please try again.'}
					</p>
					<p className="text-xs text-slate-500 dark:text-slate-400 relative z-10">
						Redirecting to login page...
					</p>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-8 overflow-y-auto">
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ type: 'spring', stiffness: 100 }}
				className="relative w-full max-w-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 text-center my-auto overflow-hidden"
			>
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-400/5 rounded-full blur-3xl -z-0" />
				
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
					className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 dark:shadow-green-600/20 relative z-10"
				>
					<CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
				</motion.div>
				<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 relative z-10">
					Authentication Successful
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed relative z-10">Completing your login...</p>
				<div className="flex justify-center relative z-10">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 dark:border-primary-400 border-t-transparent"></div>
				</div>
			</motion.div>
		</div>
	);
}
