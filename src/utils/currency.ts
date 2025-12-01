import type { SupportedCurrency } from '../services/currencyService';
import { useCurrencyStore } from '../store/currencyStore';

/**
 * Format a number as currency
 */
export function formatCurrency(
	amount: number | string | null | undefined,
	currencyCode?: string,
	options?: {
		showSymbol?: boolean;
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
	}
): string {
	if (amount === null || amount === undefined || amount === '') {
		return '—';
	}

	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	
	if (isNaN(numAmount)) {
		return '—';
	}

	// Get currency from store if not provided
	const preferredCurrency = useCurrencyStore.getState().preferredCurrency;
	const currency = currencyCode || preferredCurrency || 'USD';

	// Get currency metadata
	const supportedCurrencies = useCurrencyStore.getState().supportedCurrencies;
	const currencyMeta = supportedCurrencies.find((c) => c.code === currency);

	const {
		showSymbol = true,
		minimumFractionDigits = currencyMeta?.decimalPlaces ?? 2,
		maximumFractionDigits = currencyMeta?.decimalPlaces ?? 2,
	} = options || {};

	// Format number
	const formatted = new Intl.NumberFormat('en-US', {
		minimumFractionDigits,
		maximumFractionDigits,
	}).format(numAmount);

	// Add symbol if needed
	if (showSymbol && currencyMeta) {
		return `${currencyMeta.symbol}${formatted}`;
	}

	return formatted;
}

/**
 * Format currency with compact notation (e.g., 1.5K, 2.3M)
 */
export function formatCurrencyCompact(
	amount: number | string | null | undefined,
	currencyCode?: string
): string {
	if (amount === null || amount === undefined || amount === '') {
		return '—';
	}

	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	
	if (isNaN(numAmount)) {
		return '—';
	}

	const preferredCurrency = useCurrencyStore.getState().preferredCurrency;
	const currency = currencyCode || preferredCurrency || 'USD';

	const supportedCurrencies = useCurrencyStore.getState().supportedCurrencies;
	const currencyMeta = supportedCurrencies.find((c) => c.code === currency);

	const formatted = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1,
		minimumFractionDigits: 0,
	}).format(numAmount);

	if (currencyMeta) {
		return `${currencyMeta.symbol}${formatted}`;
	}

	return formatted;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode?: string): string {
	const preferredCurrency = useCurrencyStore.getState().preferredCurrency;
	const currency = currencyCode || preferredCurrency || 'USD';

	const supportedCurrencies = useCurrencyStore.getState().supportedCurrencies;
	const currencyMeta = supportedCurrencies.find((c) => c.code === currency);

	return currencyMeta?.symbol || '$';
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode?: string): string {
	const preferredCurrency = useCurrencyStore.getState().preferredCurrency;
	const currency = currencyCode || preferredCurrency || 'USD';

	const supportedCurrencies = useCurrencyStore.getState().supportedCurrencies;
	const currencyMeta = supportedCurrencies.find((c) => c.code === currency);

	return currencyMeta?.name || 'US Dollar';
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
	// Remove currency symbols and spaces
	const cleaned = value.replace(/[^\d.-]/g, '');
	return parseFloat(cleaned) || 0;
}

