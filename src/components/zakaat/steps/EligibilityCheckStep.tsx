import { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { alert } from '../../../store/alertStore';
import type { EligibilityCheckRequest } from '../../../types/zakaat.types';
import { useCurrencyStore } from '../../../store/currencyStore';
import { useCurrencyConversion } from '../../../hooks/useCurrencyConversion';
import CurrencyInput from '../../wealth/inputs/CurrencyInput';

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
	const { preferredCurrency } = useCurrencyStore();
	const [requestedAmount, setRequestedAmount] = useState<number>(
		initialValue?.requestedAmount || 0
	);
	const [requestedCurrency, setRequestedCurrency] = useState<string>(preferredCurrency || 'NGN');
	const [convertedNairaAmount, setConvertedNairaAmount] = useState<number | null>(null);
	const [isEligible] = useState<boolean | null>(null);
	const [eligibilityMessage] = useState('');

	// Initialize currency from preferredCurrency when it changes
	useEffect(() => {
		if (preferredCurrency && !initialValue) {
			setRequestedCurrency(preferredCurrency);
		}
	}, [preferredCurrency, initialValue]);

	// Initialize converted amount if currency is NGN
	useEffect(() => {
		if (requestedCurrency === 'NGN' && requestedAmount > 0) {
			setConvertedNairaAmount(requestedAmount);
		}
	}, [requestedCurrency, requestedAmount]);
	const { convertedAmount: nairaAmount } = useCurrencyConversion(
		requestedAmount,
		requestedCurrency,
		'NGN',
		requestedAmount > 0 && requestedCurrency !== 'NGN'
	);

	// Update converted Naira amount when conversion completes
	useEffect(() => {
		if (requestedCurrency === 'NGN') {
			setConvertedNairaAmount(requestedAmount);
		} else if (nairaAmount !== null && nairaAmount !== undefined) {
			setConvertedNairaAmount(nairaAmount);
		}
	}, [requestedCurrency, requestedAmount, nairaAmount]);

	const handleContinue = () => {
		if (!requestedAmount || requestedAmount <= 0) {
			alert.error('Please enter the amount you need');
			return;
		}

		// Use converted Naira amount if currency is not NGN, otherwise use the entered amount
		const finalAmount =
			requestedCurrency === 'NGN'
				? requestedAmount
				: convertedNairaAmount || nairaAmount || requestedAmount;

		onComplete({
			eligibility: {
				requestedAmount: finalAmount, // Store the Naira value
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
			<CurrencyInput
				label="Amount Needed"
				value={requestedAmount}
				currency={requestedCurrency}
				onAmountChange={(amount) => {
					setRequestedAmount(amount);
					// Reset converted amount when amount changes
					if (requestedCurrency === 'NGN') {
						setConvertedNairaAmount(amount);
					}
				}}
				onCurrencyChange={(currency) => {
					setRequestedCurrency(currency);
					// Reset converted amount when currency changes
					if (currency === 'NGN') {
						setConvertedNairaAmount(requestedAmount);
					}
				}}
				onConversionComplete={(converted) => {
					// Store the converted Naira amount
					if (converted !== null && converted !== undefined) {
						setConvertedNairaAmount(converted);
					} else if (requestedCurrency === 'NGN') {
						setConvertedNairaAmount(requestedAmount);
					}
				}}
				showConversion={true}
			/>

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
