import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { twoFactorService, TwoFactorMethod } from '../../services/twoFactorService';
import BottomSheet from '../ui/BottomSheet';
import OtpInput from '../ui/OtpInput';
import Button from '../ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Email2FASetupSheetProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (method: TwoFactorMethod) => void;
}

export default function Email2FASetupSheet({
	isOpen,
	onClose,
	onSuccess,
}: Email2FASetupSheetProps) {
	const { user } = useAuthStore();
	const [step, setStep] = useState<'setup' | 'verify'>('setup');
	const [isLoading, setIsLoading] = useState(false);
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && step === 'setup') {
			handleSetup();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			// Reset state when sheet closes
			setStep('setup');
			setError(null);
		}
	}, [isOpen]);

	const handleSetup = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await twoFactorService.setup2FA(TwoFactorMethod.EMAIL);
			setStep('verify');
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to start 2FA setup. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		setIsSendingCode(true);
		setError(null);

		try {
			await twoFactorService.resendEmailCode();
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to resend code. Please try again.';
			setError(errorMessage);
		} finally {
			setIsSendingCode(false);
		}
	};

	const handleVerifyCode = async (code: string) => {
		if (code.length !== 6) return;

		setIsLoading(true);
		setError(null);

		try {
			await twoFactorService.verify2FA(code, TwoFactorMethod.EMAIL);
			onSuccess(TwoFactorMethod.EMAIL);
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Invalid verification code. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Enable 2FA via Email">
			<div className="space-y-4 pb-4">
				{step === 'setup' ? (
					<>
						{error && (
							<div className="p-3 bg-error-50 border border-error-200 rounded-lg flex items-start justify-between gap-2">
								<p className="text-sm text-error-600 flex-1">{error}</p>
								<button
									type="button"
									onClick={() => setError(null)}
									className="p-1 rounded-lg hover:bg-error-100 transition-colors"
								>
									<XMarkIcon className="w-4 h-4 text-error-600" />
								</button>
							</div>
						)}

						{isLoading ? (
							<div className="py-8 text-center">
								<div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
								<p className="text-sm text-slate-600">Setting up 2FA...</p>
							</div>
						) : (
							<div className="text-center py-4">
								<p className="text-sm text-slate-600">
									Click "Send Code" to receive a verification code at your email address.
								</p>
								<Button
									variant="primary"
									onClick={handleSetup}
									className="w-full mt-4"
									disabled={isLoading}
								>
									Send Code
								</Button>
							</div>
						)}
					</>
				) : (
					<>
						{error && (
							<div className="p-3 bg-error-50 border border-error-200 rounded-lg flex items-start justify-between gap-2">
								<p className="text-sm text-error-600 flex-1">{error}</p>
								<button
									type="button"
									onClick={() => setError(null)}
									className="p-1 rounded-lg hover:bg-error-100 transition-colors"
								>
									<XMarkIcon className="w-4 h-4 text-error-600" />
								</button>
							</div>
						)}

						<div className="space-y-4">
							<div className="text-center">
								<p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
									Enter Verification Code
								</p>
								<p className="text-xs text-slate-600 dark:text-slate-400">
									We sent a 6-digit code to <strong>{user?.email}</strong>
								</p>
							</div>

							<OtpInput
								length={6}
								onComplete={handleVerifyCode}
								disabled={isLoading}
								error={error ? 'Invalid code' : undefined}
							/>

							<div className="flex items-center justify-center gap-2">
								<p className="text-xs text-slate-500 dark:text-slate-400">Didn't receive the code?</p>
								<button
									type="button"
									onClick={handleResendCode}
									disabled={isSendingCode}
									className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50"
								>
									{isSendingCode ? 'Sending...' : 'Resend'}
								</button>
							</div>

							<div className="flex gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
									className="flex-1"
									disabled={isLoading}
								>
									Cancel
								</Button>
							</div>
						</div>
					</>
				)}
			</div>
		</BottomSheet>
	);
}

