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

	const [showPassword, setShowPassword] = useState(false);
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
		// Auto-submit the form when OTP is complete
		// Small delay to ensure form state is updated
		setTimeout(() => {
			handleSubmit(handleResetPassword)();
		}, 50);
	};

	if (success) {
		return (
			<div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-primary-50 sm:via-slate-50 sm:to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="w-full max-w-md sm:bg-white sm:rounded-2xl sm:shadow-2xl sm:p-8 sm:p-10 text-center"
				>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 200 }}
						className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
					>
						<CheckCircleIcon className="w-10 h-10 text-green-600" />
					</motion.div>
					<h2 className="text-2xl sm:text-xl font-bold text-slate-900 mb-4">
						Password Reset Successful!
					</h2>
					<p className="text-base sm:text-sm text-slate-600 mb-8">
						Your password has been reset successfully. Redirecting to login...
					</p>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-primary-50 sm:via-slate-50 sm:to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md sm:bg-white sm:rounded-2xl sm:shadow-2xl sm:p-8 sm:p-10"
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1 }}
					className="text-center mb-10 sm:mb-8"
				>
					<h1 className="text-3xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-2">
						Reset Your Password
					</h1>
					<p className="text-base sm:text-sm text-slate-600">
						Enter the verification code sent to your email and create a new password.
					</p>
					{emailParam && (
						<p className="text-sm sm:text-xs text-primary-600 mt-3 sm:mt-2">
							Code sent to: <strong>{emailParam}</strong>
						</p>
					)}
				</motion.div>

				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
					>
						<p className="text-sm text-red-600">{error}</p>
					</motion.div>
				)}

				<form
					onSubmit={handleSubmit(handleResetPassword)}
					className="space-y-6 sm:space-y-5"
				>
					<Input
						label="Email Address"
						type="email"
						placeholder="you@example.com"
						error={errors.email?.message}
						disabled={!!emailParam}
						className={emailParam ? 'bg-slate-50' : ''}
						{...register('email')}
					/>

					<div>
						<label className="block text-base sm:text-sm font-medium text-slate-900 mb-4 sm:mb-3 text-center">
							Verification Code
						</label>
						<OtpInput
							length={6}
							onComplete={handleOtpComplete}
							disabled={isLoading}
							error={errors.otpCode?.message}
						/>
						<p className="text-sm sm:text-xs text-slate-500 mt-4 sm:mt-3 text-center">
							Check your email for the verification code
						</p>
					</div>

					<div className="relative">
						<Input
							label="New Password"
							type={showPassword ? 'text' : 'password'}
							placeholder="Create a strong password"
							error={errors.password?.message}
							{...register('password')}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-4 top-[50px] sm:top-[42px] text-slate-500 hover:text-slate-700"
						>
							{showPassword ? (
								<EyeSlashIcon className="h-5 w-5" />
							) : (
								<EyeIcon className="h-5 w-5" />
							)}
						</button>
					</div>

					<div className="relative">
						<Input
							label="Confirm New Password"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="Confirm your password"
							error={errors.confirmPassword?.message}
							{...register('confirmPassword')}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-4 top-[50px] sm:top-[42px] text-slate-500 hover:text-slate-700"
						>
							{showConfirmPassword ? (
								<EyeSlashIcon className="h-5 w-5" />
							) : (
								<EyeIcon className="h-5 w-5" />
							)}
						</button>
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

				{emailParam && (
					<p className="mt-8 sm:mt-6 text-center text-base sm:text-sm text-slate-600">
						Didn't receive the code?{' '}
						<Link
							to="/forgot-password"
							className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
						>
							Resend code
						</Link>
					</p>
				)}

				<p className="mt-6 sm:mt-4 text-center text-base sm:text-sm text-slate-600">
					Remember your password?{' '}
					<Link
						to="/login"
						className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
