import { motion } from 'framer-motion';
import {
	CheckCircleIcon,
	XCircleIcon,
	BanknotesIcon,
	CreditCardIcon,
	ChartBarIcon,
	InformationCircleIcon,
	ArrowTopRightOnSquareIcon,
	BookOpenIcon,
} from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import { useWealthCalculationStore } from '../../../store/wealthCalculationStore';
import { useCurrencyStore } from '../../../store/currencyStore';
import { formatCurrency } from '../../../utils/currency';

interface CalculationResultsStepProps {
	onNext: () => void;
	onBack: () => void;
}

export default function CalculationResultsStep({ onNext, onBack }: CalculationResultsStepProps) {
	const { calculationResult, formState } = useWealthCalculationStore();
	const { preferredCurrency } = useCurrencyStore();

	if (!calculationResult) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col items-center justify-center py-12"
				aria-live="polite"
				aria-busy="true"
			>
				<div className="relative">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400"></div>
					<div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-primary-400 dark:border-primary-500 opacity-20"></div>
				</div>
				<p className="text-sm text-slate-600 dark:text-slate-400 mt-4" role="status">
					Calculating your Zakaat...
				</p>
			</motion.div>
		);
	}

	const {
		totalAssets,
		totalLiabilities,
		netWorth,
		meetsNisaab,
		nisaabBase,
		nisaabThreshold,
		zakatDue,
	} = calculationResult;

	const zakatRate = 2.5; // 2.5%

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
					Your Zakaat Calculation
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Based on {nisaabBase === 'gold' ? 'Gold' : 'Silver'} Nisaab standards
				</p>
			</div>

			{/* Main Result Card */}
			<div
				className={`p-6 rounded-xl border-2 ${
					meetsNisaab
						? 'bg-success-50 dark:bg-success-900/20 border-success-300 dark:border-success-700'
						: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
				}`}
			>
				<div className="flex items-center gap-3 mb-4">
					{meetsNisaab ? (
						<CheckCircleIcon className="w-8 h-8 text-success-600 dark:text-success-400" />
					) : (
						<XCircleIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
					)}
					<div className="flex-1">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{meetsNisaab ? 'Zakaat is Due' : 'Zakaat Not Due'}
						</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400">
							{meetsNisaab
								? 'Your wealth exceeds the Nisaab threshold'
								: 'Your wealth is below the Nisaab threshold'}
						</p>
					</div>
				</div>

				{meetsNisaab && zakatDue !== null && (
					<div className="mt-4 pt-4 border-t border-success-200 dark:border-success-800">
						<div className="flex items-baseline gap-2">
							<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
								Zakaat Due ({zakatRate}%):
							</span>
							<span className="text-2xl font-bold text-success-600 dark:text-success-400">
								{formatCurrency(zakatDue, preferredCurrency)}
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Breakdown */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
					Breakdown
				</h3>

				{/* Assets */}
				<div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-3">
						<BanknotesIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
						<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							Total Assets
						</h4>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-slate-600 dark:text-slate-400">
							{formState.assets.length} asset
							{formState.assets.length !== 1 ? 's' : ''}
						</span>
						<span className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{formatCurrency(totalAssets, preferredCurrency)}
						</span>
					</div>
				</div>

				{/* Liabilities */}
				<div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
					<div className="flex items-center gap-3 mb-3">
						<CreditCardIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
						<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							Total Liabilities
						</h4>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-slate-600 dark:text-slate-400">
							{formState.liabilities.length} liability
							{formState.liabilities.length !== 1 ? 'ies' : ''}
						</span>
						<span className="text-lg font-bold text-error-600 dark:text-error-400">
							-{formatCurrency(totalLiabilities, preferredCurrency)}
						</span>
					</div>
				</div>

				{/* Net Worth */}
				<div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
					<div className="flex items-center gap-3 mb-3">
						<ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
						<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							Net Worth
						</h4>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-slate-600 dark:text-slate-400">
							Assets - Liabilities
						</span>
						<span className="text-xl font-bold text-primary-600 dark:text-primary-400">
							{formatCurrency(netWorth, preferredCurrency)}
						</span>
					</div>
				</div>

				{/* Nisaab Threshold */}
				<div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
					<div className="flex items-center justify-between mb-1">
						<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
							{nisaabBase === 'gold' ? 'Gold' : 'Silver'} Nisaab Threshold:
						</span>
						<span className="text-base font-semibold text-slate-900 dark:text-slate-100">
							{formatCurrency(nisaabThreshold, preferredCurrency)}
						</span>
					</div>
					<div className="mt-2">
						<div className="flex items-center gap-2">
							<div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{
										width: `${Math.min(
											(netWorth / nisaabThreshold) * 100,
											100
										)}%`,
									}}
									transition={{ duration: 0.8, ease: 'easeOut' }}
									className={`h-full rounded-full ${
										meetsNisaab
											? 'bg-success-500 dark:bg-success-600'
											: 'bg-slate-400 dark:bg-slate-500'
									}`}
								/>
							</div>
							<span className="text-xs font-medium text-slate-600 dark:text-slate-400">
								{((netWorth / nisaabThreshold) * 100).toFixed(1)}%
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Information Banner */}
			{meetsNisaab && zakatDue !== null && (
				<div className="space-y-4">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm"
					>
						<div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-2xl -mr-12 -mt-12" />
						<div className="relative flex items-start gap-3">
							<InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
									Zakaat is calculated at 2.5% of your net worth that exceeds the
									Nisaab threshold. This calculation is based on current Nisaab
									values and should be verified annually.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Motivational Content */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-teal-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-3xl -mr-16 -mt-16" />
						<div className="relative space-y-4">
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-xl flex items-center justify-center">
									<BookOpenIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
										The Reward of Giving Zakaat
									</p>
									<div className="space-y-4">
										<div>
											<p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200 italic mb-2 font-medium">
												"Take, [O, Muhammad], from their wealth a charity by
												which you purify them and cause them increase, and
												invoke [Allah's blessings] upon them. Indeed, your
												invocations are reassurance for them. And Allah is
												Hearing and Knowing."
											</p>
											<a
												href="https://quran.com/9:103"
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors group"
											>
												<span>Read on Quran.com</span>
												<ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
											</a>
										</div>
										<div className="pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
											<p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200 mb-1 font-medium">
												"The believer's shade on the Day of Resurrection
												will be his charity."
											</p>
											<p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
												Al-Tirmidhi
											</p>
										</div>
										<div className="pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
											<p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200 mb-1 font-medium">
												"Charity extinguishes sin as water extinguishes
												fire."
											</p>
											<p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
												At-Tirmidhi & Ibn Majah
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}

			{!meetsNisaab && (
				<div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
					<div className="flex items-start gap-3">
						<InformationCircleIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
						<div className="flex-1">
							<p className="text-sm text-slate-700 dark:text-slate-300">
								Your wealth is below the {nisaabBase === 'gold' ? 'Gold' : 'Silver'}{' '}
								Nisaab threshold. You are not required to pay Zakaat at this time.
								Consider recalculating when your wealth changes.
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Navigation */}
			<div className="flex gap-3 pt-4">
				<Button variant="outline" onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button variant="primary" onClick={onNext} className="flex-1">
					{meetsNisaab ? 'Save & Set Reminders' : 'Save Calculation'}
				</Button>
			</div>
		</motion.div>
	);
}
