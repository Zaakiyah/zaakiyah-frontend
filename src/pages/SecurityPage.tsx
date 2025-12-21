import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twoFactorService, TwoFactorMethod } from '../services/twoFactorService';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
import { useTheme } from '../hooks/useTheme';
import { alert } from '../store/alertStore';
import Button from '../components/ui/Button';
import Email2FASetupSheet from '../components/security/Email2FASetupSheet';
import TOTP2FASetupSheet from '../components/security/TOTP2FASetupSheet';
import ChangePasswordSheet from '../components/security/ChangePasswordSheet';
import LoginSessionsSection from '../components/security/LoginSessionsSection';
import DeleteAccountDialog from '../components/security/DeleteAccountDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
	ShieldCheckIcon,
	CheckCircleIcon,
	XCircleIcon,
	LockClosedIcon,
	KeyIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';

export default function SecurityPage() {
	useTheme();
	const [isEmailSetupOpen, setIsEmailSetupOpen] = useState(false);
	const [isTOTPSetupOpen, setIsTOTPSetupOpen] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [isDisable2FADialogOpen, setIsDisable2FADialogOpen] = useState(false);
	const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
	const [twoFactorStatus, setTwoFactorStatus] = useState<{
		enabled: boolean;
		method?: TwoFactorMethod;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDisabling2FA, setIsDisabling2FA] = useState(false);

	useEffect(() => {
		const check2FAStatus = async () => {
			setIsLoading(true);
			try {
				const response = await twoFactorService.getStatus();
				if (response.data) {
					setTwoFactorStatus({
						enabled: response.data.enabled,
						method: response.data.method || undefined,
					});
				}
			} catch (error) {
				console.error('Failed to check 2FA status:', error);
				setTwoFactorStatus({ enabled: false });
			} finally {
				setIsLoading(false);
			}
		};

		check2FAStatus();
	}, []);

	const handle2FAEnabled = async (method: TwoFactorMethod) => {
		// Re-fetch status to ensure it's accurate
		try {
			const response = await twoFactorService.getStatus();
			if (response.data) {
				setTwoFactorStatus({
					enabled: response.data.enabled,
					method: response.data.method || undefined,
				});
			}
		} catch (error) {
			console.error('Failed to fetch 2FA status:', error);
			// Fallback to the method passed in
			setTwoFactorStatus({ enabled: true, method });
		}
		setIsEmailSetupOpen(false);
		setIsTOTPSetupOpen(false);
	};

	const handle2FADisabled = async () => {
		setIsDisabling2FA(true);
		try {
			await twoFactorService.disable2FA();
			// Re-fetch status to ensure it's up to date
			const response = await twoFactorService.getStatus();
			if (response.data) {
				setTwoFactorStatus({
					enabled: response.data.enabled,
					method: response.data.method || undefined,
				});
			}
			setIsDisable2FADialogOpen(false);
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to disable 2FA. Please try again.';
			alert.error(errorMessage, 'Error');
		} finally {
			setIsDisabling2FA(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			<PageHeader title="Security & Privacy" showBack />

			<main className="px-4 py-4 space-y-4">
				{/* Change Password Section */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 via-slate-400/5 to-slate-300/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<KeyIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Change Password</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Update your account password to keep it secure
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						onClick={() => setIsChangePasswordOpen(true)}
						className="w-full"
					>
						<LockClosedIcon className="w-4 h-4 mr-2" />
						Change Password
					</Button>
				</motion.div>

				{/* Two-Factor Authentication Section */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<ShieldCheckIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
								Two-Factor Authentication
							</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Add an extra layer of security to your account
							</p>
						</div>
					</div>

					{isLoading ? (
						<div className="py-4 text-center">
							<div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
						</div>
					) : (
						<>
							{/* 2FA Status */}
							{twoFactorStatus?.enabled ? (
								<div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800/30 mb-4 shadow-sm relative z-10">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/30 rounded-xl flex items-center justify-center shadow-sm">
											<CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
										</div>
										<div>
											<p className="text-sm font-bold text-green-900 dark:text-green-100">
												Two-Factor Authentication Enabled
											</p>
											<p className="text-xs font-medium text-green-700 dark:text-green-400">
												Method:{' '}
												{twoFactorStatus.method === TwoFactorMethod.TOTP
													? 'Authenticator App'
													: 'Email'}
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-600 mb-4 shadow-sm relative z-10">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
											<XCircleIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
										</div>
										<div>
											<p className="text-sm font-bold text-slate-900 dark:text-slate-100">
												Two-Factor Authentication Disabled
											</p>
											<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
												Your account is less secure
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Setup Options */}
							{!twoFactorStatus?.enabled ? (
								<div className="space-y-2">
									<Button
										variant="primary"
										onClick={() => setIsEmailSetupOpen(true)}
										className="w-full"
									>
										<LockClosedIcon className="w-4 h-4 mr-2" />
										Enable via Email
									</Button>
									<Button
										variant="outline"
										onClick={() => setIsTOTPSetupOpen(true)}
										className="w-full"
									>
										<ShieldCheckIcon className="w-4 h-4 mr-2" />
										Enable via Authenticator App
									</Button>
								</div>
							) : (
								<Button
									variant="outline"
									onClick={() => setIsDisable2FADialogOpen(true)}
									className="w-full border-error-200 dark:border-error-800/50 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
								>
									Disable Two-Factor Authentication
								</Button>
							)}
						</>
					)}
				</motion.div>

				{/* Login Sessions Section */}
				<LoginSessionsSection />

				{/* Delete Account Section */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-red-200/60 dark:border-red-700/50 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 via-rose-500/5 to-red-400/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/30 dark:to-rose-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Delete Account</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Permanently delete your account and all associated data
							</p>
						</div>
					</div>
					<Button
						variant="danger"
						onClick={() => setIsDeleteAccountDialogOpen(true)}
						className="w-full"
					>
						<TrashIcon className="w-4 h-4 mr-2" />
						Delete Account
					</Button>
				</motion.div>
			</main>

			<BottomNavigation />

			{/* Change Password Sheet */}
			<ChangePasswordSheet
				isOpen={isChangePasswordOpen}
				onClose={() => setIsChangePasswordOpen(false)}
			/>

			{/* Email 2FA Setup Sheet */}
			<Email2FASetupSheet
				isOpen={isEmailSetupOpen}
				onClose={() => setIsEmailSetupOpen(false)}
				onSuccess={handle2FAEnabled}
			/>

			{/* TOTP 2FA Setup Sheet */}
			<TOTP2FASetupSheet
				isOpen={isTOTPSetupOpen}
				onClose={() => setIsTOTPSetupOpen(false)}
				onSuccess={handle2FAEnabled}
			/>

			{/* Disable 2FA Confirmation Dialog */}
			<ConfirmDialog
				isOpen={isDisable2FADialogOpen}
				onClose={() => setIsDisable2FADialogOpen(false)}
				onConfirm={handle2FADisabled}
				title="Disable Two-Factor Authentication"
				message="Are you sure you want to disable Two-Factor Authentication? Your account will be less secure."
				variant="warning"
				confirmText="Disable 2FA"
				cancelText="Cancel"
				isLoading={isDisabling2FA}
			/>

			{/* Delete Account Dialog */}
			<DeleteAccountDialog
				isOpen={isDeleteAccountDialogOpen}
				onClose={() => setIsDeleteAccountDialogOpen(false)}
			/>
		</div>
	);
}
