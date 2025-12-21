import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { loginSchema } from '../../schemas/auth.schemas';
import type { LoginFormData } from '../../types/auth.types';
import { useLogin } from '../../hooks/useLogin';
import { useTheme } from '../../hooks/useTheme';
import { useScrollToError } from '../../hooks/useScrollToError';
import { alert } from '../../store/alertStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import OtpInput from '../../components/ui/OtpInput';
import Checkbox from '../../components/ui/Checkbox';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { TwoFactorMethod } from '../../services/twoFactorService';

export default function LoginPage() {
	useTheme();
	const {
		isLoading,
		error,
		handleLogin,
		requires2FA,
		twoFactorMethod,
		emailCodeSent,
		handleVerify2FA,
		handleCancel2FA,
	} = useLogin();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			rememberMe: false,
		},
	});

	// Scroll to first error when form errors occur
	useScrollToError(errors);

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
				<AnimatePresence mode="wait">
					{requires2FA ? (
						// 2FA Verification UI
						<motion.div
							key="2fa"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
						>
							{/* Header */}
							<div className="text-center mb-6 relative z-10">
								<div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 dark:shadow-primary-600/20">
									<LockClosedIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
								</div>
								<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
									Two-Factor Authentication
								</h1>
								<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
									{twoFactorMethod === TwoFactorMethod.EMAIL
										? emailCodeSent
											? 'We sent a 6-digit code to your email. Please enter it below.'
											: 'Enter the 6-digit code from your email.'
										: 'Enter the 6-digit code from your authenticator app.'}
								</p>
							</div>

							{/* Error Message */}
							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl relative z-10"
								>
									<p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
								</motion.div>
							)}

							{/* 2FA Code Input */}
							<div className="mb-6 relative z-10">
								<OtpInput
									length={6}
									onComplete={handleVerify2FA}
									disabled={isLoading}
									autoFocus={true}
									error={error || undefined}
								/>
							</div>

							{/* Back Button */}
							<Button
								type="button"
								variant="outline"
								size="lg"
								onClick={handleCancel2FA}
								disabled={isLoading}
								className="w-full flex items-center justify-center gap-2 relative z-10"
							>
								<ArrowLeftIcon className="w-5 h-5" />
								Back to Login
							</Button>
						</motion.div>
					) : (
						// Login Form
						<motion.div
							key="login"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.3 }}
						>
							{/* Header */}
							<div className="text-center mb-6 relative z-10">
								<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
									Welcome back!
								</h1>
								<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
									We are excited to have you back.
								</p>
							</div>

							{/* Error Message */}
							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl relative z-10"
								>
									<p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
								</motion.div>
							)}

							{/* Login Form */}
							<form onSubmit={handleSubmit(handleLogin)} className="space-y-5 relative z-10">
								<Input
									label="Email"
									type="email"
									placeholder="you@example.com"
									error={errors.email?.message}
									{...register('email')}
								/>

								<PasswordInput
									label="Password"
									placeholder="Enter your password"
									error={errors.password?.message}
									showRequirements={false}
									{...register('password')}
								/>

								<div className="flex items-center justify-between">
									<Checkbox
										checked={watch('rememberMe') || false}
										onChange={(checked) => setValue('rememberMe', checked)}
										label="Remember me"
									/>

									<Link
										to="/forgot-password"
										className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
									>
										Forgot password?
									</Link>
								</div>

								<Button
									type="submit"
									variant="primary"
									size="lg"
									isLoading={isLoading}
									className="w-full"
								>
									Sign In
								</Button>
							</form>

							{/* Divider */}
							<div className="mt-6 relative z-10">
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t-2 border-slate-200 dark:border-slate-700"></div>
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400 font-medium">
											Or continue with
										</span>
									</div>
								</div>

								{/* OAuth Buttons */}
								<div className="mt-4 grid grid-cols-2 gap-3">
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => {
											window.location.href = `${
												import.meta.env.VITE_API_URL ||
												'http://localhost:3001'
											}/auth/google`;
										}}
									>
										<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
											<path
												fill="currentColor"
												d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											/>
											<path
												fill="currentColor"
												d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											/>
											<path
												fill="currentColor"
												d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											/>
											<path
												fill="currentColor"
												d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											/>
										</svg>
										Google
									</Button>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => {
											alert.info(
												'Apple login is not available at the moment. Please use Google or email/password to sign in.',
												'Feature Not Available'
											);
										}}
										title="Apple login is not available at the moment"
									>
										<svg
											className="w-5 h-5 mr-2"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.08-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
										</svg>
										Apple
									</Button>
								</div>
							</div>

							{/* Sign Up Link */}
							<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 relative z-10">
								Don't have an account?{' '}
								<Link
									to="/signup"
									className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
								>
									Sign up
								</Link>
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
