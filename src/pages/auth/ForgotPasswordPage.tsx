import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema } from '../../schemas/auth.schemas';
import type { ForgotPasswordFormData } from '../../types/auth.types';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import { useTheme } from '../../hooks/useTheme';
import { useScrollToError } from '../../hooks/useScrollToError';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPasswordPage() {
	useTheme();
	const { isLoading, error, handleForgotPassword } = useForgotPassword();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
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
				
				<div className="text-center mb-6 relative z-10">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Forgot Password?</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
						Enter your email address and we'll send you a verification code to reset
						your password.
					</p>
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

				<form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-5 relative z-10">
					<Input
						label="Email Address"
						type="email"
						placeholder="you@example.com"
						error={errors.email?.message}
						{...register('email')}
					/>

					<Button
						type="submit"
						variant="primary"
						size="lg"
						isLoading={isLoading}
						className="w-full"
					>
						Send Reset Code
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 relative z-10">
					Remember your password?{' '}
					<Link
						to="/login"
						className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
