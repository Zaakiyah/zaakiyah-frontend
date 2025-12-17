import axios from 'axios';
import { logger } from '../utils/logger';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

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
	 */
	async resolveAccount(
		bankCode: string,
		accountNumber: string
	): Promise<PaystackAccountResolution | null> {
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
