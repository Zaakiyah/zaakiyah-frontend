import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ScaleIcon, InformationCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import { useWealthCalculationStore } from '../../../store/wealthCalculationStore';
import { useCurrencyStore } from '../../../store/currencyStore';
import { nisaabService } from '../../../services/nisaabService';
import { formatCurrency } from '../../../utils/currency';
import { recommendNisaabBase } from '../../../utils/wealthRecommendations';
import type { NisaabBase, NisaabData } from '../../../types/wealth.types';
import { alert } from '../../../store/alertStore';

interface NisaabSelectionStepProps {
	onNext: () => void;
	onBack: () => void;
}

export default function NisaabSelectionStep({ onNext, onBack }: NisaabSelectionStepProps) {
	const { formState, setNisaabBase, setNisaabData, calculate } = useWealthCalculationStore();
	const { preferredCurrency } = useCurrencyStore();
	const [selectedBase, setSelectedBase] = useState<NisaabBase | null>(
		formState.nisaabBase || 'gold'
	);
	const [nisaabData, setLocalNisaabData] = useState<NisaabData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [recommendation, setRecommendation] = useState<any>(null);

	// Calculate net worth to determine if user meets Silver but not Gold
	const totalAssets = formState.assets.reduce(
		(sum, asset) =>
			sum +
			(asset.convertedAmount !== undefined && asset.convertedAmount !== null
				? asset.convertedAmount
				: asset.amount),
		0
	);
	const totalLiabilities = formState.liabilities.reduce(
		(sum, liability) =>
			sum +
			(liability.convertedAmount !== undefined && liability.convertedAmount !== null
				? liability.convertedAmount
				: liability.amount),
		0
	);
	const netWorth = totalAssets - totalLiabilities;

	useEffect(() => {
		const fetchNisaabData = async () => {
			try {
				setIsLoading(true);
				const currency = preferredCurrency || 'USD';
				const response = await nisaabService.getTodayNisaab(currency);

				if (response?.data) {
					const nisaab: NisaabData = {
						goldNisaabValue: Number(response.data.goldNisaabValue) || 0,
						silverNisaabValue: Number(response.data.silverNisaabValue) || 0,
						goldPricePerGram: Number(response.data.goldPricePerGram) || 0,
						silverPricePerGram: Number(response.data.silverPricePerGram) || 0,
						currency: response.data.currency || currency,
						date: response.data.gregorianDate || new Date().toISOString(),
					};

					setLocalNisaabData(nisaab);
					setNisaabData(nisaab);

					// Get recommendation
					const nisaabRecommendation = recommendNisaabBase(
						formState.assets,
						formState.liabilities,
						nisaab
					);
					setRecommendation(nisaabRecommendation);

					// Set default selection based on recommendation if not already set
					if (!formState.nisaabBase) {
						setSelectedBase(nisaabRecommendation.recommended);
					}
				}
			} catch (error) {
				console.error('Error fetching Nisaab data:', error);
				alert.error('Failed to load Nisaab values. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchNisaabData();
	}, [preferredCurrency, netWorth, setNisaabData]);

	const handleBaseSelect = (base: NisaabBase) => {
		setSelectedBase(base);
	};

	const handleContinue = () => {
		if (!selectedBase) {
			alert.warning('Please select a Nisaab base before continuing.');
			return;
		}

		if (!nisaabData) {
			alert.error('Nisaab data is not available. Please try again.');
			return;
		}

		// Save selection to store
		setNisaabBase(selectedBase);
		setNisaabData(nisaabData);

		// Calculate with selected base
		calculate();
		onNext();
	};

	const goldSelected = selectedBase === 'gold';
	const silverSelected = selectedBase === 'silver';
	const meetsGold = nisaabData ? netWorth >= nisaabData.goldNisaabValue : false;
	const meetsSilver = nisaabData ? netWorth >= nisaabData.silverNisaabValue : false;

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
					Select Nisaab Base
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Choose whether to calculate Zakaat based on Gold or Silver Nisaab values. Gold
					is the default standard.
				</p>
				<p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
					All currencies will be converted to your preferred currency ({preferredCurrency}
					) for calculation.
				</p>
			</div>

			{/* Net Worth Summary */}
			<div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
						Your Net Worth:
					</span>
					<span className="text-lg font-bold text-slate-900 dark:text-slate-100">
						{formatCurrency(netWorth, preferredCurrency)}
					</span>
				</div>
			</div>

			{/* Loading State */}
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
					<span className="ml-3 text-sm text-slate-600 dark:text-slate-400">
						Loading Nisaab values...
					</span>
				</div>
			) : nisaabData ? (
				<>
					{/* Gold Option */}
					<button
						onClick={() => handleBaseSelect('gold')}
						className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
							goldSelected
								? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
								: 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800'
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<ScaleIcon
										className={`w-6 h-6 ${
											goldSelected
												? 'text-primary-600 dark:text-primary-400'
												: 'text-slate-600 dark:text-slate-400'
										}`}
									/>
									<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
										Gold
									</h3>
									{goldSelected && (
										<CheckCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
									)}
								</div>
								<p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
									Gold Nisaab (87.48g of gold) - Recommended standard
								</p>
								<div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
									<div className="flex items-start gap-2 mb-2">
										<BookOpenIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5 shrink-0" />
										<div className="flex-1">
											<p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
												<strong>Scholarly Opinion:</strong> Most
												contemporary scholars recommend using Gold Nisaab as
												it provides a more stable and consistent threshold
												for Zakaat calculation.
											</p>
											<p className="text-xs text-slate-600 dark:text-slate-400">
												Based on the hadith: "There is no Zakaat (due) on
												less than five Uqiyyah (of silver)." (Bukhari). Gold
												Nisaab is derived from equivalent value of 612.36g
												silver.
											</p>
										</div>
									</div>
								</div>
								<div className="space-y-2 mt-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-slate-700 dark:text-slate-300">
											Nisaab Value:
										</span>
										<span className="text-base font-semibold text-slate-900 dark:text-slate-100">
											{formatCurrency(
												nisaabData.goldNisaabValue,
												nisaabData.currency
											)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-slate-700 dark:text-slate-300">
											Status:
										</span>
										<span
											className={`text-sm font-semibold ${
												meetsGold
													? 'text-success-600 dark:text-success-400'
													: 'text-slate-500 dark:text-slate-400'
											}`}
										>
											{meetsGold ? '✓ Meets Nisaab' : 'Below Nisaab'}
										</span>
									</div>
								</div>
							</div>
						</div>
					</button>

					{/* Silver Option */}
					<button
						onClick={() => handleBaseSelect('silver')}
						className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
							silverSelected
								? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
								: 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800'
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<ScaleIcon
										className={`w-6 h-6 ${
											silverSelected
												? 'text-primary-600 dark:text-primary-400'
												: 'text-slate-600 dark:text-slate-400'
										}`}
									/>
									<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
										Silver
									</h3>
									{silverSelected && (
										<CheckCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
									)}
								</div>
								<div className="flex items-center gap-2 mb-3">
									<p className="text-sm text-slate-600 dark:text-slate-400">
										Silver Nisaab (612.36g of silver)
									</p>
									{recommendation?.recommended === 'silver' && (
										<span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full">
											Recommended
										</span>
									)}
								</div>
								<div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
									<div className="flex items-start gap-2">
										<BookOpenIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5 shrink-0" />
										<div className="flex-1">
											<p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
												<strong>Historical Basis:</strong> Silver Nisaab is
												directly mentioned in authentic hadith. Some
												scholars prefer this as it's the original Prophetic
												standard.
											</p>
											<p className="text-xs text-slate-600 dark:text-slate-400">
												Hadith: "No Zakaat is due on property amounting to
												less than five Uqiyyah (of silver)." - Sahih
												al-Bukhari 1405
											</p>
										</div>
									</div>
								</div>
								<div className="space-y-2 mt-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-slate-700 dark:text-slate-300">
											Nisaab Value:
										</span>
										<span className="text-base font-semibold text-slate-900 dark:text-slate-100">
											{formatCurrency(
												nisaabData.silverNisaabValue,
												nisaabData.currency
											)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-slate-700 dark:text-slate-300">
											Status:
										</span>
										<span
											className={`text-sm font-semibold ${
												meetsSilver
													? 'text-success-600 dark:text-success-400'
													: 'text-slate-500 dark:text-slate-400'
											}`}
										>
											{meetsSilver ? '✓ Meets Nisaab' : 'Below Nisaab'}
										</span>
									</div>
								</div>
							</div>
						</div>
					</button>

					{/* Recommendation Banner */}
					{recommendation && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className={`p-4 rounded-xl border ${
								recommendation.recommended === 'gold'
									? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
									: 'bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800'
							}`}
						>
							<div className="flex items-start gap-3">
								<InformationCircleIcon
									className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
										recommendation.recommended === 'gold'
											? 'text-primary-600 dark:text-primary-400'
											: 'text-info-600 dark:text-info-400'
									}`}
								/>
								<div className="flex-1">
									<p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
										{recommendation.recommended === 'gold'
											? 'Recommended: Gold Nisaab'
											: 'Recommended: Silver Nisaab'}
									</p>
									<p className="text-sm text-slate-700 dark:text-slate-300">
										{recommendation.reason}
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</>
			) : (
				<div className="p-4 bg-error-50 dark:bg-error-900/20 rounded-xl border border-error-200 dark:border-error-800">
					<p className="text-sm text-error-600 dark:text-error-400">
						Failed to load Nisaab values. Please try again.
					</p>
				</div>
			)}

			{/* Navigation */}
			<div className="flex gap-3 pt-4">
				<Button variant="outline" onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button
					variant="primary"
					onClick={handleContinue}
					className="flex-1"
					disabled={!selectedBase || !nisaabData || isLoading}
				>
					Continue
				</Button>
			</div>
		</motion.div>
	);
}
