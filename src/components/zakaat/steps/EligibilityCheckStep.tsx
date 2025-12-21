import { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { alert } from '../../../store/alertStore';
import type { EligibilityCheckRequest } from '../../../types/zakaat.types';
import { useCurrencyStore } from '../../../store/currencyStore';
import { useCurrencyConversion } from '../../../hooks/useCurrencyConversion';
import { formatCurrency } from '../../../utils/currency';

interface EligibilityCheckStepProps {
	initialValue?: EligibilityCheckRequest | null;
	onComplete: (data: { eligibility: EligibilityCheckRequest }) => void;
	onBack: () => void;
}

export default function EligibilityCheckStep({
	initialValue,
	onComplete,
	onBack,
}: EligibilityCheckStepProps) {
	const [requestedAmount, setRequestedAmount] = useState<string>(
		initialValue?.requestedAmount?.toString() || ''
	);
	const [isEligible] = useState<boolean | null>(null);
	const [eligibilityMessage] = useState('');
	const { preferredCurrency } = useCurrencyStore();
	const amountNum = requestedAmount ? parseFloat(requestedAmount) : 0;
	const { convertedAmount: nairaAmount, isLoading: isConverting } = useCurrencyConversion(
		amountNum,
		preferredCurrency,
		'NGN',
		amountNum > 0 && preferredCurrency !== 'NGN'
	);

	const handleContinue = () => {
		if (!requestedAmount) {
			alert.error('Please enter the amount you need');
			return;
		}

		onComplete({
			eligibility: {
				requestedAmount: parseFloat(requestedAmount),
			},
		});
	};

	return (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
					How much do you need?
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Enter the amount you need for your Zakaat application
				</p>
			</div>

			{/* Amount */}
			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Amount Needed <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
						{formatCurrency(0, preferredCurrency, { showSymbol: true }).charAt(0)}
					</span>
					<input
						type="number"
						value={requestedAmount}
						onChange={(e) => setRequestedAmount(e.target.value)}
						placeholder="0.00"
						min="0"
						step="0.01"
						className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
					/>
				</div>
				{requestedAmount && amountNum > 0 && preferredCurrency !== 'NGN' && (
					<div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
						{isConverting ? (
							<span>Converting...</span>
						) : nairaAmount ? (
							<span>
								≈ {formatCurrency(nairaAmount, 'NGN', { showSymbol: true })} (NGN)
							</span>
						) : null}
					</div>
				)}
			</div>

			{/* Eligibility Result */}
			{isEligible !== null && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={`p-4 rounded-xl ${
						isEligible
							? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
							: 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
					}`}
				>
					<div className="flex items-start gap-3">
						{isEligible ? (
							<CheckCircleIconSolid className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
						) : (
							<CheckCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
						)}
						<div className="flex-1">
							<p
								className={`text-sm font-semibold mb-1 ${
									isEligible
										? 'text-green-800 dark:text-green-200'
										: 'text-red-800 dark:text-red-200'
								}`}
							>
								{isEligible ? 'Congratulations!' : 'Not Eligible'}
							</p>
							<p
								className={`text-sm ${
									isEligible
										? 'text-green-700 dark:text-green-300'
										: 'text-red-700 dark:text-red-300'
								}`}
							>
								{eligibilityMessage}
							</p>
						</div>
					</div>
				</motion.div>
			)}

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				<button
					onClick={onBack}
					className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Back
				</button>
				<button
					onClick={handleContinue}
					disabled={!requestedAmount}
					className="flex-1 px-4 py-3 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
				>
					Continue
				</button>
			</div>
		</div>
	);
}
