import api from '../lib/api';
import { logger } from '../utils/logger';
import type { ApiResponse } from '../types/wealth.types';
import type {
	Recipient,
	Donation,
	DonationBasket,
} from '../types/donation.types';

export const donationService = {
	/**
	 * Get approved applications as recipients
	 */
	async getRecipients(params?: {
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<{ data: Recipient[]; meta: any }>> {
		try {
			const response = await api.get<ApiResponse<{ data: Recipient[]; meta: any }>>(
				'/donations/recipients',
				{ params }
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching recipients:', error);
			throw error;
		}
	},

	/**
	 * Initialize payment for donation
	 */
	async initiatePayment(data: {
		basket: DonationBasket;
		paymentMethod: 'paystack' | 'wallet';
	}): Promise<ApiResponse<{ donationId: string; paymentLink: string; reference: string }>> {
		try {
			const payload = {
				recipients: data.basket.items.map((item) => ({
					recipientId: item.recipientId,
					applicationId: item.recipient.applicationId,
					amount: item.amount,
				})),
				totalAmount: data.basket.items.reduce((sum, item) => sum + item.amount, 0) + data.basket.zaakiyahAmount,
				zaakiyahAmount: data.basket.zaakiyahAmount,
				paymentMethod: data.paymentMethod,
				distributionMethod: data.basket.distributionMethod || 'manual',
				isAnonymous: data.basket.isAnonymous,
			};

			const response = await api.post<
				ApiResponse<{ donationId: string; paymentLink: string; reference: string }>
			>('/donations/initiate-payment', payload);
			return response.data;
		} catch (error: any) {
			logger.error('Error initiating payment:', error);
			throw error;
		}
	},

	/**
	 * Verify payment after Paystack redirect
	 */
	async verifyPayment(
		donationId: string,
		reference: string
	): Promise<ApiResponse<{ status: string; donation: Donation }>> {
		try {
			const response = await api.post<ApiResponse<{ status: string; donation: Donation }>>(
				'/donations/verify-payment',
				{ donationId, reference }
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error verifying payment:', error);
			throw error;
		}
	},

	/**
	 * Get user's donation history
	 */
	async getDonationHistory(params?: {
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<{ data: Donation[]; meta: any }>> {
		try {
			const response = await api.get<ApiResponse<{ data: Donation[]; meta: any }>>(
				'/donations/history',
				{ params }
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching donation history:', error);
			throw error;
		}
	},

	/**
	 * Get donation by ID
	 */
	async getDonationById(id: string): Promise<ApiResponse<Donation>> {
		try {
			const response = await api.get<ApiResponse<Donation>>(`/donations/${id}`);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching donation:', error);
			throw error;
		}
	},
};



