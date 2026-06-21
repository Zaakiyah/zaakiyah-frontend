import api from '../lib/api';
import { logger } from '../utils/logger';
import type {
	ZakaatApplication,
	EligibilityCheckRequest,
	EligibilityCheckResponse,
	CreateZakaatApplicationRequest,
	PaginatedResponse,
	ApplicationStatus,
	ApplicationType,
} from '../types/zakaat.types';
import type { ApiResponse } from '../types/wealth.types';

export const zakaatService = {
	/**
	 * Check eligibility for Zakaat application
	 */
	async checkEligibility(
		data: EligibilityCheckRequest
	): Promise<ApiResponse<EligibilityCheckResponse>> {
		try {
			const response = await api.post<ApiResponse<EligibilityCheckResponse>>(
				'/zakaat/eligibility/check',
				data
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error checking eligibility:', error);
			throw error;
		}
	},

	/**
	 * Create a new Zakaat application
	 */
	async createApplication(
		data: CreateZakaatApplicationRequest
	): Promise<ApiResponse<ZakaatApplication>> {
		try {
			const response = await api.post<ApiResponse<ZakaatApplication>>(
				'/zakaat/applications',
				data
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error creating application:', error);
			throw error;
		}
	},

	/**
	 * Get user's applications
	 */
	async getApplications(params?: {
		page?: number;
		limit?: number;
		status?: ApplicationStatus;
		applicationType?: ApplicationType;
	}): Promise<ApiResponse<PaginatedResponse<ZakaatApplication>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<ZakaatApplication>>>(
				'/zakaat/applications',
				{ params }
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching applications:', error);
			throw error;
		}
	},

	/**
	 * Get application by ID
	 */
	async getApplicationById(id: string): Promise<ApiResponse<ZakaatApplication>> {
		try {
			const response = await api.get<ApiResponse<ZakaatApplication>>(
				`/zakaat/applications/${id}`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching application:', error);
			throw error;
		}
	},

	/**
	 * Update application
	 */
	async updateApplication(
		id: string,
		data: Partial<CreateZakaatApplicationRequest>
	): Promise<ApiResponse<ZakaatApplication>> {
		try {
			const response = await api.put<ApiResponse<ZakaatApplication>>(
				`/zakaat/applications/${id}`,
				data
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error updating application:', error);
			throw error;
		}
	},

	/**
	 * Submit application for review
	 */
	async submitApplication(id: string): Promise<ApiResponse<ZakaatApplication>> {
		try {
			const response = await api.post<ApiResponse<ZakaatApplication>>(
				`/zakaat/applications/${id}/submit`,
				{}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error submitting application:', error);
			throw error;
		}
	},

	/**
	 * Delete application (draft only)
	 */
	async deleteApplication(
		id: string
	): Promise<ApiResponse<{ success: boolean; message: string }>> {
		try {
			const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
				`/zakaat/applications/${id}`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error deleting application:', error);
			throw error;
		}
	},

	/**
	 * Withdraw application (submitted/under_review only)
	 */
	async withdrawApplication(
		id: string
	): Promise<
		ApiResponse<{ success: boolean; message: string; application?: ZakaatApplication }>
	> {
		try {
			const response = await api.post<
				ApiResponse<{ success: boolean; message: string; application?: ZakaatApplication }>
			>(`/zakaat/applications/${id}/withdraw`);
			return response.data;
		} catch (error: any) {
			logger.error('Error withdrawing application:', error);
			throw error;
		}
	},

	/**
	 * Get categories for intended use
	 */
	async getCategories(): Promise<ApiResponse<any[]>> {
		try {
			const response = await api.get<ApiResponse<any[]>>('/zakaat/applications/categories');
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching categories:', error);
			throw error;
		}
	},

	/**
	 * Get subcategories for a category
	 */
	async getSubcategories(categoryId: string): Promise<ApiResponse<any[]>> {
		try {
			const response = await api.get<ApiResponse<any[]>>(
				`/zakaat/applications/categories/${categoryId}/subcategories`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching subcategories:', error);
			throw error;
		}
	},
};
