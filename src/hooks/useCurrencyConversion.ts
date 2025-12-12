import { useState, useEffect } from 'react';
import { currencyService } from '../services/currencyService';

interface ConversionResult {
	convertedAmount: number | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Hook to convert an amount from one currency to another
 */
export function useCurrencyConversion(
	amount: number,
	fromCurrency: string,
	toCurrency: string,
	enabled: boolean = true
): ConversionResult {
	const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Don't convert if disabled, same currency, or invalid amount
		if (
			!enabled ||
			!fromCurrency ||
			!toCurrency ||
			fromCurrency === toCurrency ||
			amount === null ||
			amount === undefined ||
			isNaN(amount) ||
			amount <= 0
		) {
			setConvertedAmount(null);
			setIsLoading(false);
			setError(null);
			return;
		}

		let cancelled = false;

		const convert = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await currencyService.convertCurrency(
					fromCurrency,
					toCurrency,
					amount
				);

				if (!cancelled) {
					setConvertedAmount(
						response.data.convertedValue || response.data.convertedAmount || null
					);
					setIsLoading(false);
				}
			} catch (err: any) {
				if (!cancelled) {
					setError(err?.response?.data?.message || err?.message || 'Conversion failed');
					setConvertedAmount(null);
					setIsLoading(false);
				}
			}
		};

		convert();

		return () => {
			cancelled = true;
		};
	}, [amount, fromCurrency, toCurrency, enabled]);

	return { convertedAmount, isLoading, error };
}
