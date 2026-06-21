import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { deviceService } from '../../services/deviceService';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteAccountDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function DeleteAccountDialog({
	isOpen,
	onClose,
}: DeleteAccountDialogProps) {
	const navigate = useNavigate();
	const { clearAuth, user } = useAuthStore();
	const [password, setPassword] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasPassword, setHasPassword] = useState(true);

	useEffect(() => {
		if (isOpen && user) {
			// Fetch latest profile to get auth info
			authService
				.getProfile()
				.then((response) => {
					if (response.data) {
						setHasPassword(response.data.hasPassword ?? true);
						// Update user in store
						useAuthStore.getState().updateUser(response.data);
					}
				})
				.catch(() => {
					// Fallback to user from store
					setHasPassword(user.hasPassword ?? true);
				});
		}
	}, [isOpen, user]);

	const handleDelete = async () => {
		// Only require password if user has password authentication
		if (hasPassword && !password.trim()) {
			setError('Password is required to delete your account');
			return;
		}

		setIsDeleting(true);
		setError(null);

		try {
			await authService.deleteAccount(hasPassword ? password : undefined);
			// Clear device info and auth state
			deviceService.clearDeviceInfo();
			clearAuth();
			// Redirect to login
			navigate('/login', { replace: true });
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to delete account. Please try again.';
			setError(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		if (isDeleting) return;
		setPassword('');
		setError(null);
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleClose}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
					/>

					{/* Dialog */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: 'spring', stiffness: 300, damping: 25 }}
							onClick={(e) => e.stopPropagation()}
							className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
						>
							{/* Decorative gradient overlay */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 via-rose-500/10 to-red-400/5 rounded-full blur-2xl -z-0" />
							
							{/* Header */}
							<div className="flex items-start gap-4 mb-6 relative z-10">
								<div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/30 dark:to-rose-800/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 dark:shadow-red-600/20">
									<ExclamationTriangleIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
								</div>
								<div className="flex-1">
									<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
										Delete Account
									</h2>
									<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
										This action cannot be undone. All your data will be permanently deleted.
									</p>
								</div>
								<button
									onClick={handleClose}
									disabled={isDeleting}
									className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all disabled:opacity-50 shrink-0"
								>
									<XMarkIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
								</button>
							</div>

							{/* Content */}
							<div className="space-y-4 mb-6 relative z-10">
								{!hasPassword && (
									<div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800/30 rounded-xl shadow-sm">
										<p className="text-sm font-medium text-primary-700 dark:text-primary-300">
											You're signed in with OAuth. Your account will be deleted without password confirmation.
										</p>
									</div>
								)}

								{hasPassword && (
									<div>
										<label
											htmlFor="delete-password"
											className="block text-sm font-medium text-slate-700 mb-1.5"
										>
											Enter your password to confirm
										</label>
										<Input
											id="delete-password"
											type="password"
											value={password}
											onChange={(e) => {
												setPassword(e.target.value);
												setError(null);
											}}
											placeholder="Your password"
											disabled={isDeleting}
											className={error ? 'border-error-300' : ''}
											autoFocus
										/>
										{error && (
											<p className="mt-1.5 text-xs text-error-600">{error}</p>
										)}
									</div>
								)}

								<div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600 shadow-sm">
									<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
										<strong className="text-slate-900 dark:text-slate-100">Warning:</strong> Deleting your account
										will permanently remove all your data, including:
									</p>
									<ul className="mt-3 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1.5">
										<li>Your profile information</li>
										<li>All your preferences and settings</li>
										<li>Your notification history</li>
										<li>All active sessions</li>
									</ul>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={handleClose}
									disabled={isDeleting}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									variant="danger"
									onClick={handleDelete}
									disabled={isDeleting || (hasPassword && !password.trim())}
									className="flex-1"
								>
									{isDeleting ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
											Deleting...
										</>
									) : (
										'Delete Account'
									)}
								</Button>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}

