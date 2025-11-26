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
			// If there's an error, redirect to login after a delay
			setTimeout(() => {
				navigate('/login?error=oauth_failed', { replace: true });
			}, 3000);
			return;
		}

		if (token) {
			// Fetch user info using the access token
			const authenticateUser = async () => {
				try {
					// Store the token first
					localStorage.setItem('accessToken', token);

					// Fetch user profile from /me endpoint
					const response = await api.get<{
						message: string;
						statusCode: number;
						data: User;
					}>('/me');

					// Set auth state with user data and token
					setAuth(response.data.data, token);
					navigate('/dashboard', { replace: true });
				} catch (err: any) {
					console.error('OAuth callback error:', err);
					// Clear token if fetch failed
					localStorage.removeItem('accessToken');
					navigate('/login?error=oauth_failed', { replace: true });
				} finally {
					setIsLoading(false);
				}
			};

			authenticateUser();
		} else {
			// No token, redirect to login
			setIsLoading(false);
			navigate('/login', { replace: true });
		}
	}, [token, error, navigate, setAuth]);

	if (error || (!token && !isLoading)) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-primary-100 px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="w-full max-w-md"
				>
					<div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 200 }}
							className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
						>
							<ExclamationCircleIcon className="w-10 h-10 text-red-600" />
						</motion.div>
						<h2 className="text-2xl font-bold text-primary-900 mb-4">
							Authentication Failed
						</h2>
						<p className="text-slate-600 mb-8">
							{error === 'access_denied'
								? 'You cancelled the authentication process.'
								: 'An error occurred during authentication. Please try again.'}
						</p>
						<p className="text-sm text-slate-500">
							Redirecting to login page...
						</p>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-primary-100 px-4 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="w-full max-w-md"
			>
				<div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 200 }}
						className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
					>
						<CheckCircleIcon className="w-10 h-10 text-green-600" />
					</motion.div>
					<h2 className="text-2xl font-bold text-primary-900 mb-4">
						Authentication Successful
					</h2>
					<p className="text-slate-600 mb-8">Completing your login...</p>
					<div className="flex justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

