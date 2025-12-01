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
							onClick={(e) => e.stopPropagation()}
							className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto"
						>
							{/* Header */}
							<div className="flex items-start gap-4 mb-6">
								<div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center shrink-0">
									<ExclamationTriangleIcon className="w-6 h-6 text-error-600" />
								</div>
								<div className="flex-1">
									<h2 className="text-xl font-bold text-slate-900 mb-1">
										Delete Account
									</h2>
									<p className="text-sm text-slate-600">
										This action cannot be undone. All your data will be permanently deleted.
									</p>
								</div>
								<button
									onClick={handleClose}
									disabled={isDeleting}
									className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
								>
									<XMarkIcon className="w-5 h-5" />
								</button>
							</div>

							{/* Content */}
							<div className="space-y-4 mb-6">
								{!hasPassword && (
									<div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
										<p className="text-sm text-primary-700">
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

								<div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
									<p className="text-xs text-slate-600">
										<strong className="text-slate-900">Warning:</strong> Deleting your account
										will permanently remove all your data, including:
									</p>
									<ul className="mt-2 text-xs text-slate-600 list-disc list-inside space-y-1">
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

