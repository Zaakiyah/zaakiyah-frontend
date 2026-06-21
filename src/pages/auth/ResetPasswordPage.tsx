import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPasswordSchema } from '../../schemas/auth.schemas';
import type { ResetPasswordFormData } from '../../types/auth.types';
import { useResetPassword } from '../../hooks/useResetPassword';
import { useTheme } from '../../hooks/useTheme';
import { useScrollToError } from '../../hooks/useScrollToError';
import Button from '../../components/ui/Button';
import PasswordInput from '../../components/ui/PasswordInput';
import OtpInput from '../../components/ui/OtpInput';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { authService } from '../../services/authService';

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const emailParam = searchParams.get('email') || '';
	useTheme();
	const [isResending, setIsResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<string | null>(null);
	const [resendError, setResendError] = useState<string | null>(null);

	const { isLoading, error, success, handleResetPassword } = useResetPassword();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			email: emailParam,
			otpCode: '',
		},
	});

	// Scroll to first error when form errors occur
	useScrollToError(errors);

	const handleOtpComplete = (code: string) => {
		setValue('otpCode', code, { shouldValidate: true });
		setTimeout(() => {
			handleSubmit(handleResetPassword)();
		}, 50);
	};

	const handleResendCode = async () => {
		if (!emailParam) return;
		setIsResending(true);
		setResendMessage(null);
		setResendError(null);
		try {
			await authService.forgotPassword(emailParam);
			setResendMessage('A new verification code has been sent.');
		} catch (err: any) {
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				'Unable to resend code right now. Please try again.';
			setResendError(msg);
		} finally {
			setIsResending(false);
		}
	};

	if (success) {
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
						Password Reset Successful!
					</h2>
					<p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed relative z-10">
						Your password has been reset successfully. Redirecting to login...
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
				className="relative w-full max-w-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 my-auto overflow-hidden"
			>
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
				<div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary-500/10 to-transparent rounded-full blur-2xl -z-0" />
				
				<div className="text-center mb-6 relative z-10">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
						Reset Your Password
					</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
						Enter the verification code sent to your email and create a new password.
					</p>
					{emailParam && (
						<p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-2">
							Code sent to: <strong>{emailParam}</strong>
						</p>
					)}
				</div>

				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl relative z-10"
					>
						<p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
					</motion.div>
				)}

				<form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5 relative z-10">
					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
							Verification Code
						</label>
						<OtpInput
							length={6}
							onComplete={handleOtpComplete}
							error={errors.otpCode?.message}
						/>
						{errors.otpCode && (
							<p className="mt-1 text-xs text-error-600">{errors.otpCode.message}</p>
						)}
						{emailParam && (
							<div className="mt-2 flex items-center justify-between text-xs">
								<p className="text-slate-600 dark:text-slate-400">
									Didn't get the code?
								</p>
								<button
									type="button"
									onClick={handleResendCode}
									disabled={isResending}
									className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50"
								>
									{isResending ? 'Sending…' : 'Resend'}
								</button>
							</div>
						)}
						{resendMessage && (
							<p className="mt-1 text-xs text-green-600 dark:text-green-400">
								{resendMessage}
							</p>
						)}
						{resendError && (
							<p className="mt-1 text-xs text-error-600 dark:text-error-400">
								{resendError}
							</p>
						)}
					</div>

					<PasswordInput
						label="New Password"
						placeholder="Enter new password"
						error={errors.password?.message}
						showRequirements={true}
						{...register('password')}
					/>

					<PasswordInput
						label="Confirm Password"
						placeholder="Confirm new password"
						error={errors.confirmPassword?.message}
						showRequirements={false}
						{...register('confirmPassword')}
					/>

					<Button
						type="submit"
						variant="primary"
						size="lg"
						isLoading={isLoading}
						className="w-full"
					>
						Reset Password
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 relative z-10">
					Remember your password?{' '}
					<Link
						to="/login"
						className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
