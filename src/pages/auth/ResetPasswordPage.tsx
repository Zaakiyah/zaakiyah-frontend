import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPasswordSchema } from '../../schemas/auth.schemas';
import type { ResetPasswordFormData } from '../../types/auth.types';
import { useResetPassword } from '../../hooks/useResetPassword';
import { useTheme } from '../../hooks/useTheme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import OtpInput from '../../components/ui/OtpInput';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const emailParam = searchParams.get('email') || '';
	useTheme();

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
			<div className="h-screen-vh bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-2 overflow-y-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 text-center my-auto"
				>
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
						className="mx-auto w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4"
					>
						<CheckCircleIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
					</motion.div>
					<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
						Password Reset Successful!
					</h2>
					<p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
						Your password has been reset successfully. Redirecting to login...
					</p>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="h-screen-vh bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-2 overflow-y-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 my-auto"
			>
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">
						Reset Your Password
					</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Enter the verification code sent to your email and create a new password.
					</p>
					{emailParam && (
						<p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
							Code sent to: <strong>{emailParam}</strong>
						</p>
					)}
				</div>

				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800/30 rounded-lg"
					>
						<p className="text-sm text-error-600 dark:text-error-400">{error}</p>
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

				<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
					Remember your password?{' '}
					<Link
						to="/login"
						className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
