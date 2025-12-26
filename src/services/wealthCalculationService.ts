import api from '../lib/api';
import { logger } from '../utils/logger';
import type {
	WealthCalculation,
	Asset,
	Liability,
	NisaabBase,
	CalculationResult,
	ApiResponse,
	PaginatedCalculations,
} from '../types/wealth.types';

// ============================================================================
// CLIENT-SIDE CALCULATION HELPERS
// ============================================================================

/**
 * Generate a unique ID for assets/liabilities
 */
export const generateId = (): string => {
	return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mock Nisaab Data
 */
export const getMockNisaabData = (currency: string = 'NGN') => {
	return {
		goldNisaabValue: 500000,
		silverNisaabValue: 300000,
		goldPricePerGram: 5000,
		silverPricePerGram: 500,
		currency,
		date: new Date().toISOString(),
	};
};

/**
 * Mock calculation result
 */
export const getMockCalculationResult = (
	assets: Asset[],
	liabilities: Liability[],
	nisaabBase: NisaabBase,
	nisaabData: any
): CalculationResult => {
	const totalAssets = assets.reduce(
		(sum, asset) => sum + (asset.convertedAmount || asset.amount),
		0
	);
	const totalLiabilities = liabilities.reduce(
		(sum, liability) => sum + (liability.convertedAmount || liability.amount),
		0
	);
	const netWorth = totalAssets - totalLiabilities;

	const nisaabThreshold =
		nisaabBase === 'gold' ? nisaabData.goldNisaabValue : nisaabData.silverNisaabValue;
	const meetsNisaab = netWorth >= nisaabThreshold;
	const zakatDue = meetsNisaab ? netWorth * 0.025 : null;

	return {
		totalAssets,
		totalLiabilities,
		netWorth,
		meetsNisaab,
		nisaabBase,
		nisaabThreshold,
		zakatDue,
		zakatRate: 2.5,
	};
};

// ============================================================================
// API SERVICE INTERFACE (Will be implemented in Phase 6)
// ============================================================================

export const wealthCalculationService = {
	/**
	 * Calculate wealth (draft calculation)
	 * Performs client-side calculation for the wizard preview
	 */
	async calculate(
		assets: Asset[],
		liabilities: Liability[],
		nisaabBase: NisaabBase,
		currency: string
	): Promise<CalculationResult> {
		// Client-side calculation for wizard preview
		const mockNisaabData = getMockNisaabData(currency);
		return getMockCalculationResult(assets, liabilities, nisaabBase, mockNisaabData);
	},

	/**
	 * Save calculation with preferences
	 */
	async saveCalculation(
		calculation: Omit<WealthCalculation, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<ApiResponse<WealthCalculation>> {
		try {
			// Helper function to sanitize numeric values
			const sanitizeNumber = (value: any): number => {
				const num = typeof value === 'number' ? value : Number(value);
				return isNaN(num) || num < 0 ? 0 : num;
			};

			// Sanitize assets: ensure amounts are valid numbers >= 0
			const sanitizedAssets = calculation.assets.map((asset: any) => ({
				...asset,
				amount: sanitizeNumber(asset.amount),
				convertedAmount:
					asset.convertedAmount !== undefined
						? sanitizeNumber(asset.convertedAmount)
						: undefined,
				weight: asset.weight !== undefined ? sanitizeNumber(asset.weight) : undefined,
				pricePerGram:
					asset.pricePerGram !== undefined
						? sanitizeNumber(asset.pricePerGram)
						: undefined,
				count:
					asset.count !== undefined
						? Math.max(0, Math.floor(sanitizeNumber(asset.count)))
						: undefined,
			}));

			// Sanitize liabilities: ensure amounts are valid numbers >= 0
			const sanitizedLiabilities = calculation.liabilities.map((liability: any) => ({
				...liability,
				amount: sanitizeNumber(liability.amount),
				convertedAmount:
					liability.convertedAmount !== undefined
						? sanitizeNumber(liability.convertedAmount)
						: undefined,
			}));

			// Convert notification preferences from nested to flat structure
			// Check if notificationPreferences exists (nested) or use flat structure
			const notificationPrefs = (calculation as any).notificationPreferences;
			const flatNotificationPrefs = notificationPrefs
				? {
						notificationEnabled: notificationPrefs.enabled,
						notificationFrequency: notificationPrefs.frequency,
						customIntervalMonths: notificationPrefs.customIntervalMonths,
						notifyRecalculate: notificationPrefs.notifyRecalculate,
						notifyZakatDue: notificationPrefs.notifyZakatDue,
						notifyNisaabChange: notificationPrefs.notifyNisaabChange,
						notifySummary: notificationPrefs.notifySummary,
						email: notificationPrefs.email,
						inApp: notificationPrefs.inApp,
						push: notificationPrefs.push,
				  }
				: calculation.notificationEnabled !== undefined
				? {
						notificationEnabled: calculation.notificationEnabled,
						notificationFrequency: calculation.notificationFrequency,
						customIntervalMonths: calculation.customIntervalMonths,
						notifyRecalculate: calculation.notifyRecalculate,
						notifyZakatDue: calculation.notifyZakatDue,
						notifyNisaabChange: calculation.notifyNisaabChange,
						notifySummary: calculation.notifySummary,
				  }
				: undefined;

			const response = await api.post<ApiResponse<WealthCalculation>>(
				'/wealth/calculate',
				{
					assets: sanitizedAssets,
					liabilities: sanitizedLiabilities,
					nisaabBase: calculation.nisaabBase,
					...(flatNotificationPrefs
						? { notificationPreferences: flatNotificationPrefs }
						: {}),
					name: calculation.name,
				},
				{
					params: {
						currency: calculation.currency,
					},
				}
			);

			return response.data;
		} catch (error: any) {
			logger.error('Error saving calculation:', error);
			// Fallback to mock for development
			const mockCalculation: WealthCalculation = {
				...calculation,
				id: generateId(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			return {
				message: 'Calculation saved successfully (mock)',
				statusCode: 201,
				data: mockCalculation,
			};
		}
	},

	/**
	 * Get all saved calculations
	 */
	async getCalculations(
		page: number = 1,
		limit: number = 10,
		status?: string
	): Promise<ApiResponse<PaginatedCalculations>> {
		try {
			const response = await api.get<ApiResponse<PaginatedCalculations>>(
				'/wealth',
				{
					params: { page, limit, status },
				}
			);

			// Response already uses PaginatedResultDto format (items + pagination)
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching calculations:', error);
			return {
				message: 'Failed to retrieve calculations',
				statusCode: 500,
				data: {
					items: [],
					pagination: {
						totalItems: 0,
						currentPage: page,
						itemsPerPage: limit,
						totalPages: 0,
					},
				} as PaginatedCalculations,
			};
		}
	},

	/**
	 * Get single calculation by ID
	 */
	async getCalculationById(id: string): Promise<ApiResponse<WealthCalculation>> {
		try {
			const response = await api.get<ApiResponse<WealthCalculation>>(`/wealth/${id}`);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching calculation:', error);
			throw error;
		}
	},

	/**
	 * Update calculation
	 */
	async updateCalculation(
		id: string,
		updates: Partial<WealthCalculation>
	): Promise<ApiResponse<WealthCalculation>> {
		try {
			// Convert notification preferences from nested to flat structure if provided
			const notificationPrefs = (updates as any).notificationPreferences;
			const flatNotificationPrefs = notificationPrefs
				? {
						notificationEnabled: notificationPrefs.enabled,
						notificationFrequency: notificationPrefs.frequency,
						customIntervalMonths: notificationPrefs.customIntervalMonths,
						notifyRecalculate: notificationPrefs.notifyRecalculate,
						notifyZakatDue: notificationPrefs.notifyZakatDue,
						notifyNisaabChange: notificationPrefs.notifyNisaabChange,
						notifySummary: notificationPrefs.notifySummary,
				  }
				: undefined;

			const response = await api.put<ApiResponse<WealthCalculation>>(`/wealth/${id}`, {
				name: updates.name,
				status: updates.status,
				...(flatNotificationPrefs ? flatNotificationPrefs : {}),
			});
			return response.data;
		} catch (error: any) {
			logger.error('Error updating calculation:', error);
			throw error;
		}
	},

	/**
	 * Delete calculation
	 */
	async deleteCalculation(id: string): Promise<ApiResponse<null>> {
		try {
			const response = await api.delete<ApiResponse<null>>(`/wealth/${id}`);
			return response.data;
		} catch (error: any) {
			logger.error('Error deleting calculation:', error);
			throw error;
		}
	},

	/**
	 * Archive calculation
	 */
	async archiveCalculation(id: string): Promise<ApiResponse<WealthCalculation>> {
		try {
			const response = await api.put<ApiResponse<WealthCalculation>>(`/wealth/${id}`, {
				status: 'archived',
			});
			return response.data;
		} catch (error: any) {
			logger.error('Error archiving calculation:', error);
			throw error;
		}
	},

	/**
	 * Unarchive calculation
	 */
	async unarchiveCalculation(id: string): Promise<ApiResponse<WealthCalculation>> {
		try {
			const response = await api.put<ApiResponse<WealthCalculation>>(`/wealth/${id}`, {
				status: 'active',
			});
			return response.data;
		} catch (error: any) {
			logger.error('Error unarchiving calculation:', error);
			throw error;
		}
	},

	/**
	 * Recalculate with current nisaab values
	 * Note: This endpoint will be implemented in a future update
	 */
	async recalculate(
		_calculationId: string,
		_currentNisaabData: any
	): Promise<ApiResponse<CalculationResult>> {
		// Feature to be implemented in future release
		return {
			message: 'Recalculation feature coming soon',
			statusCode: 501,
			data: {} as CalculationResult,
		};
	},
};
