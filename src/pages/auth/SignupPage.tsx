import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { signupSchema } from '../../schemas/auth.schemas';
import type { SignupFormData } from '../../types/auth.types';
import { useSignup } from '../../hooks/useSignup';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import PhoneInput from '../../components/ui/PhoneInput';
import OtpInput from '../../components/ui/OtpInput';
import PreferenceSelector from '../../components/auth/PreferenceSelector';
import AvatarSelector from '../../components/auth/AvatarSelector';
import SignupProgressSteps from '../../components/auth/SignupProgressSteps';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

	// Store form data as user progresses
	const watchedData = watch();

	useEffect(() => {
		setFormData((prev) => ({ ...prev, ...watchedData }));
	}, [watchedData]);

	// Ensure email is available when form is submitted
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
		<div className="min-h-screen bg-slate-50 py-6 px-4">
			<div className="max-w-2xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6"
				>
				{/* Header */}
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-slate-900 mb-1.5">
						Create Your Account
					</h1>
					<p className="text-sm text-slate-600">
						Join Zaakiyah and start your journey
					</p>
				</div>

				{/* Progress Steps */}
				<SignupProgressSteps currentStep={step} />

				{/* Error Message */}
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg"
						>
							<p className="text-sm text-error-600">{error}</p>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence mode="wait">
					{/* Step 1: Email */}
					{step === 'email' && (
						<motion.div
							key="email"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
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

					{/* Step 2: Verify Code */}
					{step === 'verify' && (
						<motion.div
							key="verify"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
						>
							<div>
								<p className="text-base sm:text-sm text-slate-600 mb-8 sm:mb-6 text-center">
									We've sent a 6-digit code to{' '}
									<strong className="text-slate-900">{email}</strong>
								</p>
								<OtpInput
									length={6}
									onComplete={(code) => {
										handleVerifyCode(code);
									}}
									disabled={isLoading}
								/>
								<p className="text-sm sm:text-xs text-slate-500 mt-6 sm:mt-4 text-center">
									Didn't receive the code?{' '}
									<button
										type="button"
										onClick={handleSendCode}
										className="text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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

					{/* Step 3: Basic Info */}
					{step === 'basicInfo' && (
						<motion.div
							key="basicInfo"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
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
								className="bg-slate-50"
							/>

							<PasswordInput
								label="Password"
								placeholder="Create a strong password"
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
										placeholder="Confirm your password"
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

					{/* Step 4: Avatar Selection */}
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

					{/* Step 5: Login PIN */}
					{step === 'pin' && (
						<motion.div
							key="pin"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
						>
							<div>
								<label className="block text-base sm:text-sm font-medium text-slate-900 mb-4 sm:mb-3 text-center">
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
								<p className="text-sm sm:text-xs text-slate-500 mt-3 text-center">
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

					{/* Step 6: Preferences */}
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

							<div className="flex items-start">
								<input
									id="acceptTerms"
									type="checkbox"
									className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
									{...register('acceptTerms')}
								/>
								<label
									htmlFor="acceptTerms"
									className="ml-3 text-sm text-slate-700"
								>
									I accept the{' '}
									<a href="#" className="text-primary-600 hover:text-primary-500">
										Terms and Conditions
									</a>
								</label>
							</div>
							{errors.acceptTerms && (
								<p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
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

				{/* Sign In Link */}
				<p className="mt-6 text-center text-sm text-slate-600">
					Already have an account?{' '}
					<Link
						to="/login"
						className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
			</div>
		</div>
	);
}
