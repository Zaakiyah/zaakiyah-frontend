import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPasswordSchema } from '../../schemas/auth.schemas';
import type { ResetPasswordFormData } from '../../types/auth.types';
import { useResetPassword } from '../../hooks/useResetPassword';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/ui/OtpInput';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const emailParam = searchParams.get('email') || '';

	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

	const handleOtpComplete = (code: string) => {
		setValue('otpCode', code, { shouldValidate: true });
		setTimeout(() => {
			handleSubmit(handleResetPassword)();
		}, 50);
	};

	if (success) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
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
						Password Reset Successful!
					</h2>
					<p className="text-sm text-slate-600 mb-4">
						Your password has been reset successfully. Redirecting to login...
					</p>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200/60 p-6"
			>
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-slate-900 mb-1.5">
						Reset Your Password
					</h1>
					<p className="text-sm text-slate-600">
						Enter the verification code sent to your email and create a new password.
					</p>
					{emailParam && (
						<p className="text-xs text-primary-600 mt-2">
							Code sent to: <strong>{emailParam}</strong>
						</p>
					)}
				</div>

				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg"
					>
						<p className="text-sm text-error-600">{error}</p>
					</motion.div>
				)}

				<form
					onSubmit={handleSubmit(handleResetPassword)}
					className="space-y-4"
				>
					<div>
						<label className="block text-sm font-medium text-slate-900 mb-2">
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
					</div>

					<Input
						label="New Password"
						type="password"
						placeholder="Enter new password"
						error={errors.password?.message}
						{...register('password')}
					/>

					<div className="relative">
						<label className="block text-sm font-medium text-slate-900 mb-2">
							Confirm Password
						</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="Confirm new password"
								className={`
									w-full px-5 py-3
									text-sm
									rounded-xl border-2 transition-all duration-200
									focus:outline-none focus:ring-2 focus:ring-offset-0
									bg-white pr-12
									${
										errors.confirmPassword
											? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
											: 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
									}
								`}
								{...register('confirmPassword')}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
							>
								{showConfirmPassword ? (
									<EyeSlashIcon className="h-5 w-5" />
								) : (
									<EyeIcon className="h-5 w-5" />
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className="mt-2 text-sm text-error-600">{errors.confirmPassword.message}</p>
						)}
					</div>

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

				<p className="mt-6 text-center text-sm text-slate-600">
					Remember your password?{' '}
					<Link
						to="/login"
						className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
