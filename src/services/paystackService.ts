import axios from 'axios';
import { logger } from '../utils/logger';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Cache for account resolution (cache key: bankCode-accountNumber)
const accountResolutionCache = new Map<string, { data: PaystackAccountResolution; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface PaystackBank {
	code: string;
	name: string;
	slug: string;
	us_supported: boolean;
	uk_supported: boolean;
}

export interface PaystackAccountResolution {
	account_number: string;
	account_name: string;
	bank_id: number;
}

export const paystackService = {
	/**
	 * Get list of Nigerian banks
	 */
	async getBanks(): Promise<PaystackBank[]> {
		try {
			const response = await axios.get<{
				status: boolean;
				message: string;
				data: PaystackBank[];
			}>(`${PAYSTACK_BASE_URL}/bank?country=nigeria`);
			if (response.data.status && response.data.data) {
				return response.data.data;
			}
			return [];
		} catch (error: any) {
			logger.error('Error fetching banks:', error);
			throw error;
		}
	},

	/**
	 * Resolve account number to account name
	 * Note: This requires a backend endpoint with Paystack secret key
	 * Results are cached for 24 hours to avoid repeated API calls
	 */
	async resolveAccount(
		bankCode: string,
		accountNumber: string
	): Promise<PaystackAccountResolution | null> {
		// Check cache first
		const cacheKey = `${bankCode}-${accountNumber}`;
		const cached = accountResolutionCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			logger.debug('Returning cached account resolution');
			return cached.data;
		}

		try {
			const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
			const token = localStorage.getItem('accessToken');
			const response = await axios.post<{
				message: string;
				statusCode: number;
				data: PaystackAccountResolution;
			}>(
				`${apiBaseUrl}/zakaat/applications/paystack/resolve-account`,
				{ bankCode, accountNumber },
				{
					headers: {
						Authorization: token ? `Bearer ${token}` : undefined,
						'Content-Type': 'application/json',
					},
				}
			);
			if (response.data.data) {
				// Cache the result
				accountResolutionCache.set(cacheKey, {
					data: response.data.data,
					timestamp: Date.now(),
				});
				return response.data.data;
			}
			return null;
		} catch (error: any) {
			logger.error('Error resolving account:', error);
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			}
			return null;
		}
	},
};
