import { useState, useEffect } from 'react';
import { twoFactorService, TwoFactorMethod } from '../../services/twoFactorService';
import BottomSheet from '../ui/BottomSheet';
import OtpInput from '../ui/OtpInput';
import Button from '../ui/Button';
import { XMarkIcon, CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface TOTP2FASetupSheetProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (method: TwoFactorMethod) => void;
}

export default function TOTP2FASetupSheet({
	isOpen,
	onClose,
	onSuccess,
}: TOTP2FASetupSheetProps) {
	const [step, setStep] = useState<'setup' | 'verify' | 'recovery'>('setup');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [secret, setSecret] = useState<string | null>(null);
	const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
	const [recoveryCodeCopied, setRecoveryCodeCopied] = useState(false);

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
			setQrCode(null);
			setSecret(null);
			setRecoveryCode(null);
			setRecoveryCodeCopied(false);
		}
	}, [isOpen]);

	const handleSetup = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await twoFactorService.setup2FA(TwoFactorMethod.TOTP);
			if (response.data) {
				setQrCode(response.data.qrCode || null);
				setSecret(response.data.secret || null);
				setRecoveryCode(response.data.recoveryCode || null);
				setStep('verify');
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to start 2FA setup. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyCode = async (code: string) => {
		if (code.length !== 6) return;

		setIsLoading(true);
		setError(null);

		try {
			await twoFactorService.verify2FA(code, TwoFactorMethod.TOTP);
			if (recoveryCode) {
				setStep('recovery');
			} else {
				onSuccess(TwoFactorMethod.TOTP);
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Invalid verification code. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyRecoveryCode = async () => {
		if (recoveryCode) {
			try {
				await navigator.clipboard.writeText(recoveryCode);
				setRecoveryCodeCopied(true);
				setTimeout(() => setRecoveryCodeCopied(false), 2000);
			} catch (err) {
				console.error('Failed to copy recovery code:', err);
			}
		}
	};

	const handleFinish = () => {
		onSuccess(TwoFactorMethod.TOTP);
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Enable 2FA via Authenticator">
			<div className="space-y-4 pb-4">
				{step === 'setup' && (
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
									Preparing your authenticator app setup...
								</p>
							</div>
						)}
					</>
				)}

				{step === 'verify' && (
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
								<p className="text-sm font-medium text-slate-900 mb-2">
									Scan QR Code with Your Authenticator App
								</p>
								<p className="text-xs text-slate-600 mb-4">
									Use an app like Google Authenticator, Authy, or Microsoft Authenticator
								</p>
							</div>

							{qrCode && (
								<div className="flex justify-center mb-4">
									<div className="bg-white p-4 rounded-lg border-2 border-slate-200">
										<img
											src={qrCode}
											alt="2FA QR Code"
											className="w-48 h-48"
										/>
									</div>
								</div>
							)}

							{secret && (
								<div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
									<p className="text-xs text-slate-500 mb-1">Or enter this code manually:</p>
									<p className="text-sm font-mono font-semibold text-slate-900 break-all">
										{secret}
									</p>
								</div>
							)}

							<div className="text-center">
								<p className="text-sm font-medium text-slate-900 mb-1">
									Enter Verification Code
								</p>
								<p className="text-xs text-slate-600 mb-4">
									Enter the 6-digit code from your authenticator app
								</p>
							</div>

							<OtpInput
								length={6}
								onComplete={handleVerifyCode}
								disabled={isLoading}
								error={error ? 'Invalid code' : undefined}
							/>

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

				{step === 'recovery' && recoveryCode && (
					<div className="space-y-4">
						<div className="text-center mb-4">
							<CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
							<p className="text-sm font-medium text-slate-900 mb-1">
								2FA Enabled Successfully!
							</p>
							<p className="text-xs text-slate-600">
								Please save your recovery code in a safe place
							</p>
						</div>

						<div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
							<div className="flex items-start justify-between gap-2 mb-2">
								<p className="text-sm font-semibold text-amber-900">
									Your Recovery Code
								</p>
								<button
									type="button"
									onClick={handleCopyRecoveryCode}
									className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
									title="Copy recovery code"
								>
									<DocumentDuplicateIcon className="w-4 h-4 text-amber-700" />
								</button>
							</div>
							<p className="text-sm font-mono font-semibold text-amber-900 break-all mb-2">
								{recoveryCode}
							</p>
							{recoveryCodeCopied && (
								<p className="text-xs text-amber-700">✓ Copied to clipboard</p>
							)}
							<p className="text-xs text-amber-800 mt-3">
								⚠️ Save this code in a secure place. You'll need it if you lose access to your authenticator app.
							</p>
						</div>

						<Button
							variant="primary"
							onClick={handleFinish}
							className="w-full"
						>
							I've Saved My Recovery Code
						</Button>
					</div>
				)}
			</div>
		</BottomSheet>
	);
}

