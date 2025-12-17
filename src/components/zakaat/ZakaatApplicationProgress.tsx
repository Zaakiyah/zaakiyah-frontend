import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
	UserIcon,
	BuildingOfficeIcon,
	CurrencyDollarIcon,
	IdentificationIcon,
	BanknotesIcon,
	DocumentTextIcon,
	ClipboardDocumentCheckIcon,
	CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/outline';

type ZakaatStep =
	| 'welcome'
	| 'type'
	| 'eligibility'
	| 'personalInfo'
	| 'identity'
	| 'financial'
	| 'intendedUse'
	| 'bankDetails'
	| 'review';

interface ZakaatApplicationProgressProps {
	currentStep: ZakaatStep;
	applicationType?: 'individual' | 'organization' | null;
}

interface StepConfig {
	id: ZakaatStep;
	label: string;
	shortLabel: string;
	icon: React.ComponentType<{ className?: string }>;
	showFor?: 'individual' | 'organization' | 'both';
}

const stepConfigs: StepConfig[] = [
	{
		id: 'type',
		label: 'Application Type',
		shortLabel: 'Type',
		icon: UserIcon,
		showFor: 'both',
	},
	{
		id: 'eligibility',
		label: 'Eligibility',
		shortLabel: 'Eligibility',
		icon: CurrencyDollarIcon,
		showFor: 'both',
	},
	{
		id: 'personalInfo',
		label: 'Personal Info',
		shortLabel: 'Info',
		icon: UserIcon,
		showFor: 'both',
	},
	{
		id: 'identity',
		label: 'Identity',
		shortLabel: 'ID',
		icon: IdentificationIcon,
		showFor: 'both',
	},
	{
		id: 'financial',
		label: 'Financial',
		shortLabel: 'Financial',
		icon: BanknotesIcon,
		showFor: 'organization',
	},
	{
		id: 'intendedUse',
		label: 'Intended Use',
		shortLabel: 'Use',
		icon: DocumentTextIcon,
		showFor: 'both',
	},
	{
		id: 'bankDetails',
		label: 'Bank Details',
		shortLabel: 'Bank',
		icon: BuildingOfficeIcon,
		showFor: 'both',
	},
	{
		id: 'review',
		label: 'Review',
		shortLabel: 'Review',
		icon: ClipboardDocumentCheckIcon,
		showFor: 'both',
	},
];

export default function ZakaatApplicationProgress({
	currentStep,
	applicationType,
}: ZakaatApplicationProgressProps) {
	// Filter steps based on application type
	const visibleSteps = stepConfigs.filter((step) => {
		if (step.showFor === 'both') return true;
		if (!applicationType) return step.id !== 'financial'; // Default to individual view
		return step.showFor === applicationType;
	});

	const currentStepIndex = visibleSteps.findIndex((s) => s.id === currentStep);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Scroll to current step
	useEffect(() => {
		if (scrollContainerRef.current && stepRefs.current[currentStepIndex]) {
			const container = scrollContainerRef.current;
			const stepElement = stepRefs.current[currentStepIndex];

			if (stepElement) {
				if (currentStepIndex === 0) {
					container.scrollTo({ left: 0, behavior: 'smooth' });
				} else {
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
						Step {currentStepIndex + 1} of {visibleSteps.length}
					</span>
					<span className="text-xs font-medium text-primary-600 dark:text-primary-400">
						{visibleSteps[currentStepIndex]?.label}
					</span>
				</div>
				<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
					<motion.div
						initial={{ width: 0 }}
						animate={{
							width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%`,
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
					{visibleSteps.map((step, index) => {
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
													? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
													: isCurrent
													? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-200 dark:ring-primary-800'
													: 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
								{index < visibleSteps.length - 1 && (
									<div
										className={`
											w-6 md:w-12 lg:w-16 h-1 mx-1 md:mx-2 rounded-full transition-all duration-500
											${
												isCompleted
													? 'bg-primary-500'
													: isCurrent
													? 'bg-primary-300 dark:bg-primary-700'
													: 'bg-slate-200 dark:bg-slate-700'
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

