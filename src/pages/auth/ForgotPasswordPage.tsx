import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema } from '../../schemas/auth.schemas';
import type { ForgotPasswordFormData } from '../../types/auth.types';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPasswordPage() {
	const { isLoading, error, handleForgotPassword } = useForgotPassword();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});

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
						Forgot Password?
					</h1>
					<p className="text-base sm:text-sm text-slate-600">
						Enter your email address and we'll send you a verification code to reset
						your password.
					</p>
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
					onSubmit={handleSubmit(handleForgotPassword)}
					className="space-y-6 sm:space-y-5"
				>
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

				<p className="mt-8 sm:mt-6 text-center text-base sm:text-sm text-slate-600">
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
