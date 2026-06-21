import { useState, useEffect } from 'react';
import BottomSheet from '../../ui/BottomSheet';
import { ScaleIcon, PencilIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { wealthCalculationService } from '../../../services/wealthCalculationService';
import { formatCurrency } from '../../../utils/currency';
import Loader from '../../ui/Loader';

interface DistributionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectEqual: (amount?: number) => void;
	onSelectManual: () => void;
	zakaatAmount?: number; // Amount from dashboard if available
}

interface WealthCalculation {
	id: string;
	zakatDue: number;
	currency: string;
	calculationDate: string;
	meetsNisaab: boolean;
}

export default function DistributionModal({
	isOpen,
	onClose,
	onSelectEqual,
	onSelectManual,
	zakaatAmount,
}: DistributionModalProps) {
	const [calculations, setCalculations] = useState<WealthCalculation[]>([]);
	const [isLoadingCalculations, setIsLoadingCalculations] = useState(false);
	const [selectedCalculationId, setSelectedCalculationId] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			fetchCalculations();
		}
	}, [isOpen]);

	const fetchCalculations = async () => {
		try {
			setIsLoadingCalculations(true);
			const response = await wealthCalculationService.getCalculations(1, 10, 'active');
			if (response.data?.items) {
				const activeCalculations = response.data.items
					.filter((calc: any) => calc.zakatDue > 0 && calc.meetsNisaab)
					.map((calc: any) => ({
						id: calc.id,
						zakatDue: calc.zakatDue || 0,
						currency: calc.currency || 'NGN',
						calculationDate: calc.calculationDate,
						meetsNisaab: calc.meetsNisaab || false,
					}));
				setCalculations(activeCalculations);
			}
		} catch (error) {
			console.error('Error fetching calculations:', error);
		} finally {
			setIsLoadingCalculations(false);
		}
	};

	const handleSelectEqual = () => {
		let amount = zakaatAmount;
		if (selectedCalculationId) {
			const selected = calculations.find((c) => c.id === selectedCalculationId);
			if (selected) {
				// Convert to Naira if needed (assuming backend returns in Naira for zakatDue)
				amount = selected.zakatDue;
			}
		}
		onSelectEqual(amount);
		onClose();
	};

	const selectedCalculation = selectedCalculationId
		? calculations.find((c) => c.id === selectedCalculationId)
		: null;

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Choose Distribution Method">
			<div className="space-y-4 pb-6">
				<p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
					How would you like to distribute your donation?
				</p>

				{/* Wealth Calculation Selection (for Equal Distribution) */}
				{calculations.length > 0 && (
					<div className="mb-4">
						<label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
							Select from your calculations (for equal distribution)
						</label>
						{isLoadingCalculations ? (
							<div className="flex items-center justify-center py-4">
								<Loader size="sm" />
							</div>
						) : (
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{calculations.map((calc) => (
									<button
										key={calc.id}
										onClick={() =>
											setSelectedCalculationId(
												selectedCalculationId === calc.id ? null : calc.id
											)
										}
										className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
											selectedCalculationId === calc.id
												? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30'
												: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-600'
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<CalculatorIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
												<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
													{formatCurrency(calc.zakatDue, calc.currency)}
												</span>
											</div>
											<span className="text-xs text-slate-500 dark:text-slate-400">
												{new Date(calc.calculationDate).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
												})}
											</span>
										</div>
									</button>
								))}
							</div>
						)}
						{selectedCalculation && (
							<div className="mt-2 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
								<p className="text-xs text-slate-600 dark:text-slate-400">
									Selected: <span className="font-semibold">{formatCurrency(selectedCalculation.zakatDue, selectedCalculation.currency)}</span> will be distributed equally
								</p>
							</div>
						)}
					</div>
				)}

				<div className="space-y-3">
					{/* Equal Distribution */}
					<button
						onClick={handleSelectEqual}
						className="w-full p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left group"
					>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
								<ScaleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
									Equal Distribution
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									{selectedCalculation
										? `Distribute ${formatCurrency(selectedCalculation.zakatDue, selectedCalculation.currency)} equally`
										: zakaatAmount
										? `Distribute ₦${zakaatAmount.toLocaleString('en-NG')} equally`
										: 'Distribute funds equally among all recipients'}
								</p>
							</div>
						</div>
					</button>

					{/* Manual Distribution */}
					<button
						onClick={() => {
							onSelectManual();
							onClose();
						}}
						className="w-full p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all text-left group"
					>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
								<PencilIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
									Manual Distribution
								</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									Manually allocate specific amounts to each recipient
								</p>
							</div>
						</div>
					</button>
				</div>
			</div>
		</BottomSheet>
	);
}
