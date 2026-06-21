import { motion } from 'framer-motion';

interface ProgressTrackerProps {
	requestedAmount: number;
	approvedAmount?: number;
	disbursedAmount?: number;
	totalDonations?: number;
	className?: string;
}

export default function ProgressTracker({
	requestedAmount,
	approvedAmount,
	disbursedAmount = 0,
	totalDonations = 0,
	className = '',
}: ProgressTrackerProps) {
	const targetAmount = approvedAmount || requestedAmount;
	const totalReceived = disbursedAmount + totalDonations;
	const progress = targetAmount > 0 ? Math.min(100, Math.round((totalReceived / targetAmount) * 100)) : 0;
	const shortfall = Math.max(0, targetAmount - totalReceived);
	const isComplete = progress >= 100;

	return (
		<div className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 shadow-lg ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
					Funding Progress
				</h3>
				<div className={`px-3 py-1 rounded-full text-xs font-semibold ${
					isComplete
						? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
						: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
				}`}>
					{progress}%
				</div>
			</div>

			{/* Progress Bar */}
			<div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className={`h-full rounded-full ${
						isComplete
							? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700'
							: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700'
					}`}
				/>
			</div>

			{/* Amount Details */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-slate-600 dark:text-slate-400">Target Amount</span>
					<span className="text-base font-semibold text-slate-900 dark:text-slate-100">
						₦{targetAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-slate-600 dark:text-slate-400">Total Received</span>
					<span className="text-base font-semibold text-primary-600 dark:text-primary-400">
						₦{totalReceived.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</span>
				</div>
				{shortfall > 0 && (
					<div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
						<span className="text-sm text-slate-600 dark:text-slate-400">Remaining</span>
						<span className="text-base font-semibold text-amber-600 dark:text-amber-400">
							₦{shortfall.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</span>
					</div>
				)}
				{isComplete && (
					<div className="pt-2 border-t border-green-200 dark:border-green-800">
						<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							<span className="text-sm font-semibold">Fully Funded!</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}


