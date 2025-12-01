import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twoFactorService, TwoFactorMethod } from '../services/twoFactorService';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
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
			alert(errorMessage);
		} finally {
			setIsDisabling2FA(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			<PageHeader title="Security & Privacy" showBack />

			<main className="px-4 py-4 space-y-4">
				{/* Change Password Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
							<KeyIcon className="w-5 h-5 text-slate-600" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 mb-1">Change Password</h2>
							<p className="text-xs text-slate-600">
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
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
							<ShieldCheckIcon className="w-5 h-5 text-primary-600" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 mb-1">
								Two-Factor Authentication
							</h2>
							<p className="text-xs text-slate-600">
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
								<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
									<div className="flex items-center gap-2">
										<CheckCircleIcon className="w-5 h-5 text-green-600" />
										<div>
											<p className="text-sm font-semibold text-green-900">
												Two-Factor Authentication Enabled
											</p>
											<p className="text-xs text-green-700">
												Method:{' '}
												{twoFactorStatus.method === TwoFactorMethod.TOTP
													? 'Authenticator App'
													: 'Email'}
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
									<div className="flex items-center gap-2">
										<XCircleIcon className="w-5 h-5 text-slate-400" />
										<div>
											<p className="text-sm font-semibold text-slate-900">
												Two-Factor Authentication Disabled
											</p>
											<p className="text-xs text-slate-600">
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
									className="w-full border-error-200 text-error-600 hover:bg-error-50"
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
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white rounded-xl p-4 shadow-sm border border-error-200/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center shrink-0">
							<TrashIcon className="w-5 h-5 text-error-600" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 mb-1">Delete Account</h2>
							<p className="text-xs text-slate-600">
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
