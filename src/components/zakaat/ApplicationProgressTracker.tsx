import { CheckIcon } from '@heroicons/react/24/solid';

interface ApplicationProgressTrackerProps {
	currentStep: number;
	totalSteps: number;
}

export default function ApplicationProgressTracker({
	currentStep,
	totalSteps,
}: ApplicationProgressTrackerProps) {
	const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

	return (
		<div className="flex items-center justify-between">
			{steps.map((step, index) => {
				const isCompleted = step < currentStep;
				const isCurrent = step === currentStep;

				return (
					<div key={step} className="flex items-center flex-1">
						{/* Step Circle */}
						<div className="flex flex-col items-center flex-1">
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
									isCompleted
										? 'bg-primary-500 text-white'
										: isCurrent
										? 'bg-primary-500 text-white ring-4 ring-primary-200 dark:ring-primary-900/30'
										: 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
								}`}
							>
								{isCompleted ? (
									<CheckIcon className="w-5 h-5" />
								) : (
									<span>{step}</span>
								)}
							</div>
						</div>

						{/* Connector Line */}
						{index < steps.length - 1 && (
							<div
								className={`h-1 flex-1 mx-1 transition-all ${
									isCompleted
										? 'bg-primary-500'
										: 'bg-slate-200 dark:bg-slate-700'
								}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
