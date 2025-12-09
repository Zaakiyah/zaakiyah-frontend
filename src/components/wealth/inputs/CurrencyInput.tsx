import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CurrencySelector from '../../ui/CurrencySelector';
import Input from '../../ui/Input';
import { useCurrencyStore } from '../../../store/currencyStore';
import { currencyService } from '../../../services/currencyService';
import { formatCurrency, parseCurrency } from '../../../utils/currency';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface CurrencyInputProps {
	label?: string;
	value: number;
	currency?: string;
	onAmountChange: (amount: number) => void;
	onCurrencyChange?: (currency: string) => void;
	onConversionComplete?: (convertedAmount: number | null) => void; // Callback when conversion completes
	error?: string;
	helperText?: string;
	disabled?: boolean;
	showConversion?: boolean; // Show converted amount in preferred currency
	className?: string;
}

export default function CurrencyInput({
	label,
	value,
	currency,
	onAmountChange,
	onCurrencyChange,
	onConversionComplete,
	error,
	helperText,
	disabled = false,
	showConversion = true,
	className = '',
}: CurrencyInputProps) {
	const { preferredCurrency, latestRates, fetchLatestRates } = useCurrencyStore();
	const [amountString, setAmountString] = useState(value.toString() || '');
	const [isConverting, setIsConverting] = useState(false);
	const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
	const [conversionError, setConversionError] = useState<string | null>(null);

	const selectedCurrency = currency || preferredCurrency;
	const needsConversion = showConversion && selectedCurrency !== preferredCurrency;

	// Sync amountString when value prop changes
	useEffect(() => {
		if (value > 0) {
			setAmountString(value.toString());
		} else if (value === 0) {
			setAmountString('');
		}
	}, [value]);

	// Fetch rates on mount if needed
	useEffect(() => {
		if (needsConversion && Object.keys(latestRates).length === 0) {
			fetchLatestRates();
		}
	}, [needsConversion, latestRates, fetchLatestRates]);

	// Convert amount when currency, value, or rates change
	useEffect(() => {
		if (needsConversion && value > 0) {
			const rateKey = `${selectedCurrency}:${preferredCurrency}`;
			const cachedRate = latestRates[rateKey]?.rate;

			if (cachedRate) {
				// Rates available, convert immediately
				convertAmount(value, selectedCurrency, preferredCurrency);
			} else if (Object.keys(latestRates).length > 0) {
				// Rates have been fetched but this specific rate might not be available
				// Try API conversion
				convertAmount(value, selectedCurrency, preferredCurrency);
			} else {
				// Wait for rates to be fetched, then convert
				const timer = setTimeout(() => {
					convertAmount(value, selectedCurrency, preferredCurrency);
				}, 500);
				return () => clearTimeout(timer);
			}
		} else if (!needsConversion) {
			// If no conversion needed (same currency), clear converted amount
			setConvertedAmount(null);
			setConversionError(null);
			onConversionComplete?.(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, selectedCurrency, preferredCurrency, needsConversion, latestRates]);

	const convertAmount = async (amount: number, from: string, to: string) => {
		// Sanitize input amount first
		const sanitizeAmount = (value: any): number => {
			const num = typeof value === 'number' ? value : Number(value);
			return isNaN(num) || num < 0 ? 0 : num;
		};

		const sanitizedInputAmount = sanitizeAmount(amount);

		if (from === to || sanitizedInputAmount === 0) {
			setConvertedAmount(null);
			onConversionComplete?.(null);
			return;
		}

		setIsConverting(true);
		setConversionError(null);

		// Helper to sanitize converted amount
		const sanitizeConvertedAmount = (value: any): number | null => {
			if (value === null || value === undefined) return null;
			const num = typeof value === 'number' ? value : Number(value);
			if (isNaN(num) || num < 0) return null;
			return num;
		};

		try {
			// Try to use cached rate first
			const rateKey = `${from}:${to}`;
			const cachedRate = latestRates[rateKey]?.rate;

			if (cachedRate) {
				const converted = sanitizedInputAmount * cachedRate;
				const sanitized = sanitizeConvertedAmount(converted);
				setConvertedAmount(sanitized);
				setIsConverting(false);
				onConversionComplete?.(sanitized);
				return;
			}

			// Fetch conversion from API - use sanitized amount
			const response = await currencyService.convertCurrency(from, to, sanitizedInputAmount);

			if (response.data) {
				// Backend returns 'convertedValue', not 'convertedAmount'
				const convertedValue =
					response.data.convertedValue || response.data.convertedAmount;
				const sanitized = sanitizeConvertedAmount(convertedValue);
				setConvertedAmount(sanitized);
				onConversionComplete?.(sanitized);
			} else {
				onConversionComplete?.(null);
			}
		} catch (error) {
			console.error('Currency conversion error:', error);
			setConversionError('Conversion unavailable');
			onConversionComplete?.(null);
		} finally {
			setIsConverting(false);
		}
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setAmountString(inputValue);

		// Allow empty input for better UX
		if (inputValue === '' || inputValue === '.') {
			onAmountChange(0);
			return;
		}

		// Parse and validate
		const parsed = parseCurrency(inputValue);
		if (!isNaN(parsed) && parsed >= 0) {
			onAmountChange(parsed);
		}
	};

	const handleBlur = () => {
		// Format the display value on blur
		if (value > 0) {
			setAmountString(formatCurrency(value, selectedCurrency, { showSymbol: false }));
		}
	};

	const handleFocus = () => {
		// Show raw number on focus for easier editing
		setAmountString(value.toString());
	};

	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
					{label}
				</label>
			)}

			<div className="space-y-2">
				{/* Currency Selector */}
				{onCurrencyChange && (
					<CurrencySelector
						value={selectedCurrency}
						onChange={onCurrencyChange}
						error={error}
						disabled={disabled}
					/>
				)}

				{/* Amount Input */}
				<div className="relative">
					<Input
						type="text"
						inputMode="decimal"
						value={amountString}
						onChange={handleAmountChange}
						onBlur={handleBlur}
						onFocus={handleFocus}
						placeholder="0.00"
						error={error}
						helperText={helperText}
						disabled={disabled}
						className="pr-10"
					/>
					{needsConversion && isConverting && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
							<ArrowPathIcon className="w-5 h-5 text-slate-400 animate-spin" />
						</div>
					)}
				</div>

				{/* Conversion Display */}
				{needsConversion &&
					convertedAmount !== null &&
					!isConverting &&
					!conversionError && (
						<motion.div
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-gradient-to-br from-primary-50 dark:from-primary-900/20 to-primary-50/80 dark:to-primary-900/10 border border-primary-200 dark:border-primary-800/50 rounded-lg px-4 py-3"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
										Converted Amount
									</p>
									<p className="text-base font-bold text-slate-900 dark:text-slate-100">
										{formatCurrency(convertedAmount, preferredCurrency)}
									</p>
								</div>
								<div className="text-right">
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{preferredCurrency}
									</p>
								</div>
							</div>
						</motion.div>
					)}

				{conversionError && (
					<p className="text-xs text-warning-600 dark:text-warning-400">
						{conversionError}
					</p>
				)}
			</div>
		</div>
	);
}
