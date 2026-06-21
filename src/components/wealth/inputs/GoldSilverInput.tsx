import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Input from '../../ui/Input';
import Checkbox from '../../ui/Checkbox';
import { formatCurrency } from '../../../utils/currency';
import { useCurrencyStore } from '../../../store/currencyStore';
import { nisaabService } from '../../../services/nisaabService';

interface GoldSilverInputProps {
	type: 'gold' | 'silver';
	weight?: number;
	pricePerGram?: number;
	onWeightChange: (weight: number) => void;
	onPriceChange: (price: number) => void;
	onUseMarketPrice?: (use: boolean) => void;
	useMarketPrice?: boolean;
	error?: string;
	helperText?: string;
	disabled?: boolean;
}

export default function GoldSilverInput({
	type,
	weight = 0,
	pricePerGram = 0,
	onWeightChange,
	onPriceChange,
	onUseMarketPrice,
	useMarketPrice = false,
	error,
	helperText,
	disabled = false,
}: GoldSilverInputProps) {
	const { preferredCurrency } = useCurrencyStore();
	const [marketPrice, setMarketPrice] = useState<number | null>(null);
	const [isLoadingMarketPrice, setIsLoadingMarketPrice] = useState(false);
	const [priceWarning, setPriceWarning] = useState<string | null>(null);

	const metalName = type === 'gold' ? 'Gold' : 'Silver';
	const totalValue = weight * pricePerGram;

	// Fetch market price on mount
	useEffect(() => {
		fetchMarketPrice();
	}, [type, preferredCurrency]);

	// Check price difference when price changes
	useEffect(() => {
		if (pricePerGram > 0 && marketPrice) {
			const difference = Math.abs(pricePerGram - marketPrice);
			const percentageDiff = (difference / marketPrice) * 100;

			if (percentageDiff > 20) {
				setPriceWarning(
					`This price is ${percentageDiff.toFixed(
						1
					)}% different from current market price (${formatCurrency(
						marketPrice,
						preferredCurrency
					)}/g). Please verify.`
				);
			} else {
				setPriceWarning(null);
			}
		}
	}, [pricePerGram, marketPrice, preferredCurrency]);

	// Auto-fill market price when toggled
	useEffect(() => {
		if (useMarketPrice && marketPrice && pricePerGram === 0) {
			onPriceChange(marketPrice);
		}
	}, [useMarketPrice, marketPrice, pricePerGram, onPriceChange]);

	const fetchMarketPrice = async () => {
		setIsLoadingMarketPrice(true);
		try {
			const response = await nisaabService.getTodayNisaab(preferredCurrency);
			if (response.data) {
				const price =
					type === 'gold'
						? Number(response.data.goldPricePerGram)
						: Number(response.data.silverPricePerGram);
				setMarketPrice(price);
			}
		} catch (error) {
			console.error('Failed to fetch market price:', error);
		} finally {
			setIsLoadingMarketPrice(false);
		}
	};

	const handleUseMarketPriceToggle = (checked: boolean) => {
		onUseMarketPrice?.(checked);
		if (checked && marketPrice) {
			onPriceChange(marketPrice);
		}
	};

	const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		// Allow empty string for better UX
		if (inputValue === '' || inputValue === '.') {
			onWeightChange(0);
			return;
		}
		const value = parseFloat(inputValue);
		if (!isNaN(value) && value >= 0) {
			onWeightChange(value);
		}
	};

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		// Allow empty string for better UX
		if (inputValue === '' || inputValue === '.') {
			onPriceChange(0);
			return;
		}
		const value = parseFloat(inputValue);
		if (!isNaN(value) && value >= 0) {
			onPriceChange(value);
		}
	};

	// Validation warnings
	const weightWarning =
		weight > (type === 'gold' ? 10000 : 100000)
			? `This weight seems very large (${weight.toFixed(0)}g). Please verify.`
			: null;

	return (
		<div className="space-y-4">
			{/* Use Market Price Toggle */}
			{onUseMarketPrice && (
				<div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200 dark:border-primary-800">
					<div className="flex items-center gap-3">
						<Checkbox
							checked={useMarketPrice}
							onChange={handleUseMarketPriceToggle}
							disabled={disabled || isLoadingMarketPrice}
							label={
								<>
									Use current market price
									{marketPrice && (
										<span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
											({formatCurrency(marketPrice, preferredCurrency)}/g)
										</span>
									)}
								</>
							}
						/>
						{isLoadingMarketPrice && (
							<div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
						)}
					</div>
				</div>
			)}

			{/* Weight Input */}
			<Input
				type="text"
				inputMode="decimal"
				label={`${metalName} Weight (grams)`}
				value={weight > 0 ? weight.toString() : ''}
				onChange={handleWeightChange}
				placeholder="0.00"
				error={error}
				helperText={
					helperText || `Enter the weight of your ${metalName.toLowerCase()} in grams`
				}
				disabled={disabled}
			/>

			{weightWarning && (
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800"
				>
					<InformationCircleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
					<p className="text-xs text-warning-800 dark:text-warning-300">
						{weightWarning}
					</p>
				</motion.div>
			)}

			{/* Price Per Gram Input */}
			<Input
				type="text"
				inputMode="decimal"
				label={`Price Per Gram (${preferredCurrency})`}
				value={pricePerGram > 0 ? pricePerGram : ''}
				onChange={handlePriceChange}
				placeholder="0.00"
				error={error}
				disabled={disabled || useMarketPrice}
			/>

			{/* Market Price Suggestion */}
			{marketPrice && !useMarketPrice && (
				<div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
					💡 Current market price: {formatCurrency(marketPrice, preferredCurrency)}/g
				</div>
			)}

			{/* Price Warning */}
			{priceWarning && (
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800"
				>
					<InformationCircleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
					<p className="text-xs text-warning-800 dark:text-warning-300">{priceWarning}</p>
				</motion.div>
			)}

			{/* Total Value Display */}
			{totalValue > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
				>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
							Total {metalName} Value:
						</span>
						<span className="text-lg font-bold text-primary-600 dark:text-primary-400">
							{formatCurrency(totalValue, preferredCurrency)}
						</span>
					</div>
					<div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
						{weight}g × {formatCurrency(pricePerGram, preferredCurrency)}/g
					</div>
				</motion.div>
			)}
		</div>
	);
}
