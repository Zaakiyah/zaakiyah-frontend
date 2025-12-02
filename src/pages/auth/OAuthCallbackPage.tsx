import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import type { User } from '../../services/authService';

export default function OAuthCallbackPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [isLoading, setIsLoading] = useState(true);
	const token = searchParams.get('token');
	const error = searchParams.get('error');

	useEffect(() => {
		if (error) {
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
		} else {
			setIsLoading(false);
			navigate('/login', { replace: true });
		}
	}, [token, error, navigate, setAuth]);

	if (error || (!token && !isLoading)) {
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
						{error === 'access_denied'
							? 'You cancelled the authentication process.'
							: error && decodeURIComponent(error) !== 'access_denied'
								? decodeURIComponent(error)
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
