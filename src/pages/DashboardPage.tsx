import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { deviceService } from '../services/deviceService';
import Button from '../components/ui/Button';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
	const navigate = useNavigate();
	const { user, clearAuth } = useAuthStore();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		if (isLoggingOut) return; // Prevent multiple clicks

		setIsLoggingOut(true);
		try {
			const { authService } = await import('../services/authService');
			await authService.logout();
			// Clear device info and auth state
			deviceService.clearDeviceInfo();
			clearAuth();
			navigate('/login');
		} catch (error) {
			console.error('Logout error:', error);
			// Even if API call fails, clear local auth state and redirect
			// This ensures user can still log out even if server is unreachable
			deviceService.clearDeviceInfo();
			clearAuth();
			navigate('/login');
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-primary-50 sm:via-slate-50 sm:to-primary-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="sm:bg-white sm:rounded-2xl sm:shadow-xl sm:p-8"
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8 sm:mb-6">
						<div>
							<h1 className="text-3xl sm:text-2xl font-bold text-slate-900">
								Welcome, {user?.firstName}!
							</h1>
							<p className="text-base sm:text-sm text-slate-600 mt-2">
								You're successfully logged in.
							</p>
						</div>
						<Button
							variant="outline"
							onClick={handleLogout}
							isLoading={isLoggingOut}
							disabled={isLoggingOut}
							className="flex items-center justify-center gap-2 w-full sm:w-auto"
						>
							{!isLoggingOut && <ArrowRightOnRectangleIcon className="w-5 h-5" />}
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</Button>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
						{user && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl sm:rounded-xl p-6 sm:p-5 text-white"
							>
								<h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-1.5">
									Email
								</h3>
								<p className="text-sm sm:text-base text-primary-100 break-words">
									{user.email}
								</p>
							</motion.div>
						)}

						{user?.mobileNumber && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl sm:rounded-xl p-6 sm:p-5 text-white"
							>
								<h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-1.5">
									Mobile
								</h3>
								<p className="text-sm sm:text-base text-secondary-100">
									{user.mobileNumber}
								</p>
							</motion.div>
						)}

						{user?.preferences && user.preferences.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl sm:rounded-xl p-6 sm:p-5 text-white sm:col-span-2 md:col-span-1"
							>
								<h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-1.5">
									Preferences
								</h3>
								<p className="text-sm sm:text-base text-purple-100">
									{user.preferences.join(', ')}
								</p>
							</motion.div>
						)}
					</div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="mt-6 sm:mt-8 p-6 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-xl"
					>
						<h2 className="text-xl sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
							Dashboard Features Coming Soon
						</h2>
						<p className="text-base sm:text-sm text-slate-600">
							This is a placeholder dashboard. More features will be added soon.
						</p>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
