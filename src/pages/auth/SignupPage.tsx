import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { signupSchema } from '../../schemas/auth.schemas';
import type { SignupFormData } from '../../types/auth.types';
import { useSignup } from '../../hooks/useSignup';
import { useTheme } from '../../hooks/useTheme';
import { useScrollToError } from '../../hooks/useScrollToError';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import PhoneInput from '../../components/ui/PhoneInput';
import OtpInput from '../../components/ui/OtpInput';
import Checkbox from '../../components/ui/Checkbox';
import PreferenceSelector from '../../components/auth/PreferenceSelector';
import AvatarSelector from '../../components/auth/AvatarSelector';
import SignupProgressSteps from '../../components/auth/SignupProgressSteps';
import { WEBSITE_PAGES } from '../../config/website';

export default function SignupPage() {
	useTheme();
	const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
	const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
	const [formData, setFormData] = useState<Partial<SignupFormData>>({});

	const {
		step,
		setStep,
		email,
		setEmail,
		isLoading,
		isSendingCode,
		error,
		setError,
		handleSendCode,
		handleVerifyCode,
		handleSignup,
	} = useSignup();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			preferences: [],
			acceptTerms: false,
		},
		mode: 'onChange',
	});

	// Scroll to first error when form errors occur
	useScrollToError(errors);

	const watchedData = watch();

	useEffect(() => {
		setFormData((prev) => ({ ...prev, ...watchedData }));
	}, [watchedData]);

	useEffect(() => {
		if (step === 'basicInfo' && !email) {
			setError('Email is required. Please go back and verify your email.');
		}
	}, [step, email, setError]);

	const handleBasicInfoNext = () => {
		const data = watch();
		if (!data.firstName || !data.lastName || !data.password || !data.confirmPassword) {
			setError('Please fill in all required fields');
			return;
		}
		if (data.password !== data.confirmPassword) {
			setError("Passwords don't match");
			return;
		}
		setFormData((prev) => ({ ...prev, ...data }));
		setError(null);
		setStep('avatar');
	};

	const handleAvatarNext = () => {
		setError(null);
		setStep('pin');
	};

	const handleAvatarSkip = () => {
		setSelectedAvatarId(null);
		setError(null);
		setStep('pin');
	};

	const handlePinNext = () => {
		const pin = watch('loginPin');
		if (!pin || pin.length !== 4) {
			setError('Please enter a 4-digit PIN');
			return;
		}
		setFormData((prev) => ({ ...prev, loginPin: pin }));
		setError(null);
		setStep('preferences');
	};

	const onSubmit = async (data: SignupFormData) => {
		await handleSignup(
			{ ...formData, ...data } as SignupFormData,
			selectedPreferences,
			selectedAvatarId || undefined
		);
	};

	const togglePreference = (pref: string) => {
		setSelectedPreferences((prev) => {
			const updated = prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref];
			setValue('preferences', updated);
			return updated;
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-8 overflow-y-auto">
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ type: 'spring', stiffness: 100 }}
				className="relative w-full max-w-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 p-6 sm:p-8 my-auto max-h-full overflow-y-auto overflow-x-hidden"
			>
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
				<div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary-500/10 to-transparent rounded-full blur-2xl -z-0" />
				
				<div className="text-center mb-6 relative z-10">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
						Create Your Account
					</h1>
					<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Join Zaakiyah and start your journey</p>
				</div>

				<div className="relative z-10 mb-6">
					<SignupProgressSteps currentStep={step} />
				</div>
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl relative z-10"
						>
							<p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence initial={false}>
					{step === 'email' && (
						<motion.div
							key="email"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ type: 'spring', stiffness: 200 }}
							className="space-y-5 relative z-10"
						>
							<Input
								label="Email Address"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<Button
								type="button"
								variant="primary"
								size="lg"
								onClick={handleSendCode}
								isLoading={isLoading}
								className="w-full"
							>
								Send Verification Code
							</Button>
						</motion.div>
					)}

					{step === 'verify' && (
						<motion.div
							key="verify"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ type: 'spring', stiffness: 200 }}
							className="space-y-5 relative z-10"
						>
							<div>
								<p className="text-base sm:text-sm text-slate-600 dark:text-slate-400 mb-8 sm:mb-6 text-center">
									We've sent a 6-digit code to{' '}
									<strong className="text-slate-900 dark:text-slate-100">{email}</strong>
								</p>
								<OtpInput
									length={6}
									onComplete={(code) => {
										handleVerifyCode(code);
									}}
									disabled={isLoading}
								/>
								<p className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 mt-6 sm:mt-4 text-center">
									Didn't receive the code?{' '}
									<button
										type="button"
										onClick={handleSendCode}
										className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
										disabled={isSendingCode || isLoading}
									>
										{isSendingCode && (
											<svg
												className="animate-spin h-3 w-3"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										)}
										Send code again
									</button>
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep('email')}
								className="w-full"
							>
								Back
							</Button>
						</motion.div>
					)}

					{step === 'basicInfo' && (
						<motion.div
							key="basicInfo"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ type: 'spring', stiffness: 200 }}
							className="space-y-5 relative z-10"
						>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Input
									label="First Name"
									placeholder="John"
									error={errors.firstName?.message}
									{...register('firstName')}
								/>
								<Input
									label="Last Name"
									placeholder="Doe"
									error={errors.lastName?.message}
									{...register('lastName')}
								/>
							</div>

							<Input
								label="Email"
								type="email"
								value={email}
								disabled
								className="bg-slate-50 dark:bg-slate-700/50"
							/>

							<PasswordInput
								label="Password"
								placeholder="Create a strong password"
								error={errors.password?.message}
								showRequirements={true}
								{...register('password')}
							/>

							<PasswordInput
								label="Confirm Password"
								placeholder="Confirm your password"
								error={errors.confirmPassword?.message}
								showRequirements={false}
								{...register('confirmPassword')}
							/>

							<PhoneInput
								label="Mobile Number (Optional)"
								error={errors.mobileNumber?.message}
								value={watch('mobileNumber') || ''}
								onChange={(value) => setValue('mobileNumber', value)}
							/>

							<div className="flex gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep('verify')}
									className="flex-1"
								>
									Back
								</Button>
								<Button
									type="button"
									variant="primary"
									size="lg"
									onClick={handleBasicInfoNext}
									className="flex-1"
								>
									Next
								</Button>
							</div>
						</motion.div>
					)}

					{step === 'avatar' && (
						<motion.div
							key="avatar"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
						>
							<AvatarSelector
								selectedAvatarId={selectedAvatarId}
								onSelect={setSelectedAvatarId}
								error={error || undefined}
							/>

							<div className="flex flex-col gap-3">
								<div className="flex gap-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => setStep('basicInfo')}
										className="flex-1"
									>
										Back
									</Button>
									<Button
										type="button"
										variant="primary"
										size="lg"
										onClick={handleAvatarNext}
										disabled={!selectedAvatarId}
										className="flex-1"
									>
										Proceed
									</Button>
								</div>
								<Button
									type="button"
									variant="outline"
									onClick={handleAvatarSkip}
									className="w-full"
								>
									Do it later
								</Button>
							</div>
						</motion.div>
					)}

					{step === 'pin' && (
						<motion.div
							key="pin"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
						>
							<div>
								<label className="block text-base sm:text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 sm:mb-3 text-center">
									4-Digit Login PIN
								</label>
								<Input
									type="text"
									inputMode="numeric"
									placeholder="1234"
									maxLength={4}
									error={errors.loginPin?.message}
									{...register('loginPin')}
									className="text-center text-2xl tracking-widest"
								/>
								<p className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
									Enter a 4-digit PIN for quick login
								</p>
							</div>

							<div className="flex gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep('avatar')}
									className="flex-1"
								>
									Back
								</Button>
								<Button
									type="button"
									variant="primary"
									size="lg"
									onClick={handlePinNext}
									className="flex-1"
								>
									Next
								</Button>
							</div>
						</motion.div>
					)}

					{step === 'preferences' && (
						<motion.form
							key="preferences"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							onSubmit={handleSubmit(onSubmit, (errors) => {
								if (Object.keys(errors).length > 0) {
									setError('Please fill in all required fields correctly');
								}
							})}
							className="space-y-4"
						>
							<PreferenceSelector
								selectedPreferences={selectedPreferences}
								onToggle={togglePreference}
								error={errors.preferences?.message}
							/>

							<Checkbox
								checked={watch('acceptTerms') || false}
								onChange={(checked) => setValue('acceptTerms', checked)}
								label={
									<>
										I accept the{' '}
										<a
											href={WEBSITE_PAGES.TERMS}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline"
										>
											Terms and Conditions
										</a>
									</>
								}
							/>
							{errors.acceptTerms && (
								<p className="text-sm text-error-600 dark:text-error-400">{errors.acceptTerms.message}</p>
							)}

							<div className="flex gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep('pin')}
									className="flex-1"
								>
									Back
								</Button>
								<Button
									type="submit"
									variant="primary"
									size="lg"
									isLoading={isLoading}
									className="flex-1"
								>
									Create Account
								</Button>
							</div>
						</motion.form>
					)}
				</AnimatePresence>

				<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
					Already have an account?{' '}
					<Link
						to="/login"
						replace
						className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
