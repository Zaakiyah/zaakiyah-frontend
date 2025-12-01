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
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200/60 p-6"
			>
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-slate-900 mb-1.5">
						Forgot Password?
					</h1>
					<p className="text-sm text-slate-600">
						Enter your email address and we'll send you a verification code to reset
						your password.
					</p>
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
					onSubmit={handleSubmit(handleForgotPassword)}
					className="space-y-4"
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
