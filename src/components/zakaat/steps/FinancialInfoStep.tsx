import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { FinancialInfo } from '../../../types/zakaat.types';

interface FinancialInfoStepProps {
	initialValue?: FinancialInfo | null;
	onComplete: (data: { financialInfo: FinancialInfo }) => void;
	onBack: () => void;
}

export default function FinancialInfoStep({
	initialValue,
	onComplete,
	onBack,
}: FinancialInfoStepProps) {
	const [businessRevenue, setBusinessRevenue] = useState<string>(
		initialValue?.businessRevenue?.toString() || '',
	);
	const [netProfit, setNetProfit] = useState<string>(
		initialValue?.netProfit?.toString() || '',
	);

	const handleSubmit = () => {
		onComplete({
			financialInfo: {
				businessRevenue: businessRevenue ? parseFloat(businessRevenue) : undefined,
				netProfit: netProfit ? parseFloat(netProfit) : undefined,
			},
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Business Revenue (Annual)
				</label>
				<div className="relative">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
						$
					</span>
					<input
						type="number"
						value={businessRevenue}
						onChange={(e) => setBusinessRevenue(e.target.value)}
						placeholder="0.00"
						min="0"
						step="0.01"
						className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Net Profit (Annual)
				</label>
				<div className="relative">
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
						$
					</span>
					<input
						type="number"
						value={netProfit}
						onChange={(e) => setNetProfit(e.target.value)}
						placeholder="0.00"
						min="0"
						step="0.01"
						className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
				</div>
			</div>

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
					onClick={handleSubmit}
					className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
				>
					Continue
				</button>
			</div>
		</div>
	);
}

