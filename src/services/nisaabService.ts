import api from '../lib/api';

export interface NisaabData {
	id: string;
	gregorianDate: string;
	hijriDate: string;
	arabicHijriDate?: string;
	goldPricePerGram: string | number | null;
	silverPricePerGram: string | number | null;
	goldNisaabValue: string | number | null;
	silverNisaabValue: string | number | null;
	currency?: string;
	createdAt: string;
	updatedAt: string;
}

// Standard nisaab values in grams
export const GOLD_NISAAB_GRAMS = 87.48;
export const SILVER_NISAAB_GRAMS = 612.36;

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export interface PaginationMetadata {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
}

export interface PaginatedNisaabHistory {
	items: NisaabData[];
	pagination: PaginationMetadata;
}

export const nisaabService = {
	async getTodayNisaab(currency?: string): Promise<ApiResponse<NisaabData>> {
		const response = await api.get<ApiResponse<NisaabData>>('/nisaab/today', {
			params: currency ? { currency } : {},
		});
		return response.data;
	},

	async getNisaabHistory(
		page = 1,
		limit = 30,
		currency?: string
	): Promise<ApiResponse<PaginatedNisaabHistory>> {
		const response = await api.get<ApiResponse<PaginatedNisaabHistory>>('/nisaab/history', {
			params: { page, limit, ...(currency ? { currency } : {}) },
		});
		return response.data;
	},

	async getNisaabByDate(date: string, currency?: string): Promise<ApiResponse<NisaabData>> {
		const response = await api.get<ApiResponse<NisaabData>>('/nisaab/by-date', {
			params: { date, ...(currency ? { currency } : {}) },
		});
		return response.data;
	},
};

