import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
	SparklesIcon,
	CurrencyDollarIcon,
	ClipboardDocumentListIcon,
	ScaleIcon,
	CalculatorIcon,
	BookmarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { WizardStep } from '../../types/wealth.types';

interface CalculationProgressProps {
	currentStep: WizardStep;
}

interface StepConfig {
	id: WizardStep;
	label: string;
	shortLabel: string;
	icon: React.ComponentType<{ className?: string }>;
}

const stepConfigs: StepConfig[] = [
	{
		id: 'welcome',
		label: 'Welcome',
		shortLabel: 'Welcome',
		icon: SparklesIcon,
	},
	{
		id: 'assets',
		label: 'Add Assets',
		shortLabel: 'Assets',
		icon: CurrencyDollarIcon,
	},
	{
		id: 'liabilities',
		label: 'Add Liabilities',
		shortLabel: 'Liabilities',
		icon: ClipboardDocumentListIcon,
	},
	{
		id: 'nisaab',
		label: 'Choose Nisaab',
		shortLabel: 'Nisaab',
		icon: ScaleIcon,
	},
	{
		id: 'results',
		label: 'Results',
		shortLabel: 'Results',
		icon: CalculatorIcon,
	},
	{
		id: 'save',
		label: 'Save',
		shortLabel: 'Save',
		icon: BookmarkIcon,
	},
];

export default function CalculationProgress({ currentStep }: CalculationProgressProps) {
	const currentStepIndex = stepConfigs.findIndex((s) => s.id === currentStep);
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
		<div className="mb-6 sm:mb-8">
			{/* Mobile: Simple progress bar with step indicator */}
			<div className="block sm:hidden">
				<div className="flex items-center justify-between mb-3">
					<span className="text-xs font-medium text-slate-600 dark:text-slate-400">
						Step {currentStepIndex + 1} of {stepConfigs.length}
					</span>
					<span className="text-xs font-medium text-primary-600 dark:text-primary-400">
						{stepConfigs[currentStepIndex].label}
					</span>
				</div>
				<div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner">
					<motion.div
						initial={{ width: 0 }}
						animate={{
							width: `${((currentStepIndex + 1) / stepConfigs.length) * 100}%`,
						}}
						transition={{ duration: 0.3, ease: 'easeOut' }}
						className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full shadow-sm"
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
					{stepConfigs.map((step, index) => {
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
								role="listitem"
								aria-current={isCurrent ? 'step' : undefined}
								aria-label={`Step ${index + 1}: ${step.label}`}
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
													? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
													: isCurrent
													? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-200 dark:ring-primary-800'
													: 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-500 dark:text-slate-400'
											}
										`}
									>
										{isCompleted ? (
											<CheckCircleIconSolid className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
										) : (
											<Icon
												className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${
													isCurrent
														? 'text-white'
														: 'text-slate-500 dark:text-slate-400'
												}`}
											/>
										)}
									</motion.div>
									<span
										className={`
											mt-2 text-[10px] md:text-xs lg:text-sm font-medium whitespace-nowrap
											transition-colors duration-300
											${
												isCompleted || isCurrent
													? 'text-primary-600 dark:text-primary-400'
													: 'text-slate-500 dark:text-slate-400'
											}
										`}
									>
										{step.shortLabel}
									</span>
								</div>
								{index < stepConfigs.length - 1 && (
									<div
										className={`
											w-6 md:w-12 lg:w-16 h-1 mx-1 md:mx-2 rounded-full transition-all duration-500
											${
												isCompleted
													? 'bg-gradient-to-r from-primary-500 to-primary-600'
													: isCurrent
													? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-700 dark:to-primary-800'
													: 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800'
											}
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
