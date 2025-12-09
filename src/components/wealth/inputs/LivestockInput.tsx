import { useState } from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Input from '../../ui/Input';
import CurrencyInput from './CurrencyInput';
import { formatCurrency } from '../../../utils/currency';
import { useCurrencyStore } from '../../../store/currencyStore';

interface LivestockInputProps {
	livestockType?: string;
	count?: number;
	valuePerUnit?: number;
	onLivestockTypeChange: (type: string) => void;
	onCountChange: (count: number) => void;
	onValuePerUnitChange: (value: number) => void;
	error?: string;
	helperText?: string;
	disabled?: boolean;
}

const LIVESTOCK_TYPES = [
	'Cattle',
	'Sheep',
	'Goats',
	'Camels',
	'Buffalo',
	'Other',
];

export default function LivestockInput({
	livestockType = '',
	count = 0,
	valuePerUnit = 0,
	onLivestockTypeChange,
	onCountChange,
	onValuePerUnitChange,
	error,
	helperText,
	disabled = false,
}: LivestockInputProps) {
	const { preferredCurrency } = useCurrencyStore();
	const [customType, setCustomType] = useState('');
	const showCustomInput = livestockType === 'Other';

	const totalValue = count * valuePerUnit;

	const handleLivestockTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		onLivestockTypeChange(value);
		if (value !== 'Other') {
			setCustomType('');
		}
	};

	const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCustomType(value);
		onLivestockTypeChange(value);
	};

	const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		if (inputValue === '' || inputValue === '.') {
			onCountChange(0);
			return;
		}
		const value = parseInt(inputValue);
		if (!isNaN(value) && value >= 0) {
			onCountChange(value);
		}
	};

	const countWarning =
		count > 10000
			? `This count seems very large (${count}). Please verify.`
			: null;

	return (
		<div className="space-y-4">
			<div className="w-full">
				<label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
					Livestock Type
				</label>
				<select
					value={showCustomInput ? 'Other' : livestockType}
					onChange={handleLivestockTypeChange}
					disabled={disabled}
					className={`
						w-full px-5 py-3 
						text-sm
						rounded-xl border-2 transition-all duration-200
						focus:outline-none focus:ring-2 focus:ring-offset-0
						bg-white dark:bg-slate-800
						text-slate-900 dark:text-slate-100
						${
							error
								? 'border-error-300 dark:border-error-600 focus:border-error-500 dark:focus:border-error-500 focus:ring-error-500/20'
								: 'border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 dark:focus:ring-primary-400/20'
						}
						${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					`}
				>
					<option value="">Select livestock type...</option>
					{LIVESTOCK_TYPES.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
				{helperText && !error && (
					<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
						{helperText || 'Select the type of livestock'}
					</p>
				)}
				{error && (
					<p className="mt-2 text-sm text-error-600 dark:text-error-400" role="alert">
						{error}
					</p>
				)}
			</div>

			{showCustomInput && (
				<Input
					type="text"
					label="Custom Livestock Type"
					value={customType}
					onChange={handleCustomTypeChange}
					placeholder="Enter livestock type"
					helperText="Specify the type of livestock"
					disabled={disabled}
				/>
			)}

			<Input
				type="text"
				inputMode="numeric"
				label="Count"
				value={count > 0 ? count.toString() : ''}
				onChange={handleCountChange}
				placeholder="0"
				error={error}
				helperText="Enter the number of livestock"
				disabled={disabled}
			/>

			{countWarning && (
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800"
				>
					<InformationCircleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
					<p className="text-xs text-warning-800 dark:text-warning-300">{countWarning}</p>
				</motion.div>
			)}

			<CurrencyInput
				label={`Value Per Unit (${preferredCurrency})`}
				value={valuePerUnit}
				currency={preferredCurrency}
				onAmountChange={onValuePerUnitChange}
				showConversion={false}
				error={error}
				helperText="Enter the value per unit of livestock"
				disabled={disabled}
			/>

			{totalValue > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
				>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
							Total Livestock Value:
						</span>
						<span className="text-lg font-bold text-primary-600 dark:text-primary-400">
							{formatCurrency(totalValue, preferredCurrency)}
						</span>
					</div>
					<div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
						{count} × {formatCurrency(valuePerUnit, preferredCurrency)}
					</div>
				</motion.div>
			)}
		</div>
	);
}

