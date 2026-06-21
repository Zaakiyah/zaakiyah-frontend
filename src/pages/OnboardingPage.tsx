import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

interface OnboardingSlide {
	id: number;
	image?: string;
	title: string;
	description: string;
	gradient: string;
	isLogoSlide?: boolean;
}

const slides: OnboardingSlide[] = [
	{
		id: 1,
		title: 'Welcome to Zaakiyah',
		description: 'Your trusted companion for Zakaat calculation and charitable giving.',
		gradient: 'from-primary-500 via-primary-400 to-primary-600',
		isLogoSlide: true,
	},
	{
		id: 2,
		image: '/onboarding-zakaat-rate.png',
		title: 'Calculate Your Zakaat',
		description:
			'Pay 2.5% of your wealth annually. Our smart calculator helps you determine your Zakaat obligations accurately.',
		gradient: 'from-secondary-500 via-secondary-400 to-secondary-600',
	},
	{
		id: 3,
		image: '/onboarding-currency.png',
		title: 'Multi-Currency Support',
		description:
			'Track and calculate your Zakaat in your preferred currency. We support multiple currencies with real-time exchange rates.',
		gradient: 'from-primary-500 via-primary-400 to-primary-600',
	},
	{
		id: 4,
		image: '/onboarding-give-confidence.png',
		title: 'Give with Confidence',
		description:
			'Make your Zakaat and Sadaqah contributions securely and track your charitable giving history all in one place.',
		gradient: 'from-error-500 via-error-400 to-error-600',
	},
];

const ONBOARDING_COMPLETED_KEY = 'zaakiyah_onboarding_completed';

export function hasCompletedOnboarding(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

export function markOnboardingCompleted(): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
	}
}

export default function OnboardingPage() {
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isExiting, setIsExiting] = useState(false);

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1);
		} else {
			handleGetStarted();
		}
	};

	const handleSkip = () => {
		handleGetStarted();
	};

	const handleGetStarted = (path: 'login' | 'signup' = 'login') => {
		setIsExiting(true);
		markOnboardingCompleted();
		setTimeout(() => {
			navigate(`/${path}`);
		}, 300);
	};

	const currentSlideData = slides[currentSlide];
	const isLastSlide = currentSlide === slides.length - 1;
	const isFirstSlide = currentSlide === 0;

	return (
		<div className="h-screen-vh bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
			{/* Skip Button - Only show after first slide */}
			{!isExiting && !isFirstSlide && (
				<motion.button
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					onClick={handleSkip}
					className="absolute top-4 right-4 z-50 p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
					aria-label="Skip onboarding"
				>
					<XMarkIcon className="w-6 h-6" />
				</motion.button>
			)}

			{/* Content */}
			<div
				className={`h-full flex flex-col items-center justify-center px-4 py-2 relative z-10 overflow-y-auto ${
					isFirstSlide ? '' : 'pt-20'
				}`}
			>
				<AnimatePresence mode="wait">
					{isFirstSlide ? (
						// First Slide: Logo Only
						<motion.div
							key="logo-slide"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.6, ease: 'easeOut' }}
							className="flex items-center justify-center absolute inset-0 pointer-events-none"
						>
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{
									scale: [1, 1.1, 1],
									rotate: 0,
								}}
								transition={{
									scale: {
										delay: 0.5,
										duration: 1.5,
										repeat: Infinity,
										ease: 'easeInOut',
									},
									rotate: {
										delay: 0.2,
										type: 'spring',
										stiffness: 200,
										damping: 15,
									},
								}}
								className="flex items-center justify-center"
							>
								<img
									src="/zaakiyah-logo.svg"
									alt="Zaakiyah Logo"
									className="w-32 h-32 drop-shadow-2xl"
								/>
							</motion.div>
						</motion.div>
					) : (
						// Other Slides: Image + Content
						<motion.div
							key={currentSlide}
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.4, ease: 'easeInOut' }}
							className="w-full max-w-md text-center space-y-8"
						>
							{/* Image */}
							<motion.div
								initial={{ scale: 0.8, opacity: 0, y: 20 }}
								animate={{ scale: 1, opacity: 1, y: 0 }}
								transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
								className="flex justify-center mb-6"
							>
								<div className="relative">
									<motion.div
										initial={{ scale: 0.9 }}
										animate={{ scale: 1 }}
										transition={{
											delay: 0.4,
											duration: 0.6,
											ease: 'easeOut',
										}}
										className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center"
									>
										<img
											src={currentSlideData.image}
											alt={currentSlideData.title}
											className="w-full h-full object-contain drop-shadow-xl"
											onError={(e) => {
												// Fallback if image doesn't exist
												const target = e.target as HTMLImageElement;
												target.style.display = 'none';
											}}
										/>
									</motion.div>
								</div>
							</motion.div>

							{/* Text Content */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4, duration: 0.5 }}
								className="space-y-4 px-4"
							>
								<h2 className="text-3xl font-bold text-slate-900">
									{currentSlideData.title}
								</h2>
								<p className="text-base text-slate-600 leading-relaxed">
									{currentSlideData.description}
								</p>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

					{/* Progress Dots */}
					{!isFirstSlide && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
							className="flex gap-2 mt-8 mb-4"
						>
							{slides.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentSlide(index)}
									className={`transition-all duration-300 rounded-full ${
										index === currentSlide
											? 'w-8 h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 shadow-sm'
											: 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
									}`}
									aria-label={`Go to slide ${index + 1}`}
								/>
							))}
						</motion.div>
					)}

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: isFirstSlide ? 0.8 : 0.6 }}
					className="w-full max-w-md space-y-3 px-4 mt-auto pb-4 relative z-20"
				>
					{isLastSlide ? (
						<>
							<Button
								variant="primary"
								onClick={() => handleGetStarted('signup')}
								className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
							>
								Create Account
								<ArrowRightIcon className="w-5 h-5" />
							</Button>
							<Button
								variant="outline"
								onClick={() => handleGetStarted('login')}
								className="w-full h-12 text-base font-semibold"
							>
								Sign In
							</Button>
						</>
					) : (
						<>
							<Button
								variant="primary"
								onClick={handleNext}
								className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
							>
								{isFirstSlide ? 'Get Started' : 'Next'}
								<ArrowRightIcon className="w-5 h-5" />
							</Button>
							{!isFirstSlide && (
								<button
									onClick={handleSkip}
									className="w-full text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-2"
								>
									Skip
								</button>
							)}
						</>
					)}
				</motion.div>
			</div>

			{/* Background Decoration */}
			{!isFirstSlide && (
				<div
					className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-5 pointer-events-none transition-all duration-500`}
				/>
			)}
		</div>
	);
}
