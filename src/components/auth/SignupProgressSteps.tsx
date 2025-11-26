import {
	EnvelopeIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	PhotoIcon,
	LockClosedIcon,
	HeartIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SignupProgressStepsProps {
	currentStep: 'email' | 'verify' | 'basicInfo' | 'avatar' | 'pin' | 'preferences';
}

interface StepConfig {
	id: 'email' | 'verify' | 'basicInfo' | 'avatar' | 'pin' | 'preferences';
	label: string;
	shortLabel: string;
	icon: React.ComponentType<{ className?: string }>;
}

export default function SignupProgressSteps({ currentStep }: SignupProgressStepsProps) {
	const steps: StepConfig[] = [
		{
			id: 'email',
			label: 'Enter Email',
			shortLabel: 'Email',
			icon: EnvelopeIcon,
		},
		{
			id: 'verify',
			label: 'Verify Code',
			shortLabel: 'Verify',
			icon: ShieldCheckIcon,
		},
		{
			id: 'basicInfo',
			label: 'Basic Info',
			shortLabel: 'Info',
			icon: UserCircleIcon,
		},
		{
			id: 'avatar',
			label: 'Select Avatar',
			shortLabel: 'Avatar',
			icon: PhotoIcon,
		},
		{
			id: 'pin',
			label: 'Login PIN',
			shortLabel: 'PIN',
			icon: LockClosedIcon,
		},
		{
			id: 'preferences',
			label: 'Preferences',
			shortLabel: 'Prefs',
			icon: HeartIcon,
		},
	];

	const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Scroll to current step or keep first step visible
	useEffect(() => {
		if (scrollContainerRef.current && stepRefs.current[currentStepIndex]) {
			const container = scrollContainerRef.current;
			const stepElement = stepRefs.current[currentStepIndex];

			if (stepElement) {
				// If on first step, scroll to start (ensure first step is visible)
				if (currentStepIndex === 0) {
					container.scrollTo({ left: 0, behavior: 'smooth' });
				} else {
					// Otherwise, scroll to center the current step
					const containerWidth = container.offsetWidth;
					const stepLeft = stepElement.offsetLeft;
					const stepWidth = stepElement.offsetWidth;
					const scrollLeft = stepLeft - containerWidth / 2 + stepWidth / 2;

					container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
				}
			}
		}
	}, [currentStepIndex]);

	return (
		<div className="mb-8 sm:mb-6">
			{/* Mobile: Simple progress bar with step indicator */}
			<div className="block sm:hidden">
				<div className="flex items-center justify-between mb-3">
					<span className="text-xs font-medium text-slate-600">
						Step {currentStepIndex + 1} of {steps.length}
					</span>
					<span className="text-xs font-medium text-primary-600">
						{steps[currentStepIndex].label}
					</span>
				</div>
				<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
					<motion.div
						initial={{ width: 0 }}
						animate={{
							width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
						}}
						transition={{ duration: 0.3, ease: 'easeOut' }}
						className="h-full bg-primary-500 rounded-full"
					/>
				</div>
			</div>

			{/* Desktop: Full stepper with icons and labels */}
			<div
				ref={scrollContainerRef}
				className="hidden sm:block overflow-x-auto overflow-y-visible pb-2 pt-4 scrollbar-hide"
				style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
			>
				<div className="flex items-center gap-1 md:gap-2 lg:gap-3 min-w-max px-2">
					{steps.map((step, index) => {
						const isCompleted = index < currentStepIndex;
						const isCurrent = index === currentStepIndex;
						const Icon = step.icon;

						return (
							<div
								key={step.id}
								ref={(el) => {
									stepRefs.current[index] = el;
								}}
								className="flex items-center shrink-0"
							>
								<div className="flex flex-col items-center">
									<motion.div
										initial={{ scale: 1 }}
										animate={{ scale: isCurrent ? 1.05 : 1 }}
										transition={{ duration: 0.2 }}
										className={`
											w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center
											transition-all duration-300
											${
												isCompleted
													? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
													: isCurrent
													? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-200'
													: 'bg-slate-200 text-slate-500'
											}
										`}
									>
										{isCompleted ? (
											<CheckCircleIconSolid className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
										) : (
											<Icon
												className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${
													isCurrent ? 'text-white' : 'text-slate-500'
												}`}
											/>
										)}
									</motion.div>
									<span
										className={`
											mt-2 text-[10px] md:text-xs lg:text-sm font-medium whitespace-nowrap
											transition-colors duration-300
											${isCompleted || isCurrent ? 'text-primary-600' : 'text-slate-500'}
										`}
									>
										{step.shortLabel}
									</span>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`
											w-6 md:w-12 lg:w-16 h-1 mx-1 md:mx-2 rounded-full transition-all duration-500
											${isCompleted ? 'bg-primary-500' : isCurrent ? 'bg-primary-300' : 'bg-slate-200'}
										`}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
