import api from '../lib/api';

export interface SupportedCurrency {
	code: string;
	name: string;
	symbol: string;
	decimalPlaces: number;
}

export interface ExchangeRate {
	rate: number;
	source: string;
	effectiveDate: string;
}

export interface CurrencyConversion {
	baseCurrency: string;
	targetCurrency: string;
	amount: number;
	convertedValue: number; // Backend returns 'convertedValue', not 'convertedAmount'
	convertedAmount?: number; // Keep for backward compatibility, will map from convertedValue
	rate: number;
	source: string;
	effectiveDate: string;
}

export interface RateHistoryItem {
	id: string;
	baseCurrency: string;
	targetCurrency: string;
	rate: number;
	source: string;
	effectiveDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface RateHistoryResponse {
	items: RateHistoryItem[];
	total: number;
}

export interface LatestRates {
	[currency: string]: {
		rate: number | null;
		source?: string;
		effectiveDate?: string;
		error?: string;
	};
}

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export const currencyService = {
	/**
	 * Get all supported currencies
	 */
	async getSupportedCurrencies(): Promise<ApiResponse<SupportedCurrency[]>> {
		const response = await api.get<ApiResponse<SupportedCurrency[]>>('/currency/supported');
		return response.data;
	},

	/**
	 * Convert currency amount
	 */
	async convertCurrency(
		baseCurrency: string,
		targetCurrency: string,
		amount: number
	): Promise<ApiResponse<CurrencyConversion>> {
		// Sanitize amount: ensure it's a valid number >= 0
		const sanitizedAmount = (() => {
			const num = typeof amount === 'number' ? amount : Number(amount);
			return isNaN(num) || num < 0 ? 0 : num;
		})();

		const response = await api.get<ApiResponse<CurrencyConversion>>('/currency/convert', {
			params: {
				baseCurrency,
				targetCurrency,
				amount: sanitizedAmount,
			},
		});
		return response.data;
	},

	/**
	 * Get latest exchange rates for all currencies
	 */
	async getLatestRates(): Promise<ApiResponse<LatestRates>> {
		const response = await api.get<ApiResponse<LatestRates>>('/currency/rates');
		return response.data;
	},

	/**
	 * Get exchange rate history
	 */
	async getRateHistory(
		targetCurrency: string,
		options?: {
			baseCurrency?: string;
			startDate?: string;
			endDate?: string;
			limit?: number;
		}
	): Promise<ApiResponse<RateHistoryResponse>> {
		const response = await api.get<ApiResponse<RateHistoryResponse>>(
			'/currency/rates/history',
			{
				params: {
					targetCurrency,
					...options,
				},
			}
		);
		return response.data;
	},
};
