import api from '../lib/api';
import { logger } from '../utils/logger';
import type { ApiResponse } from '../types/wealth.types';

export interface BugReportData {
	title: string;
	description: string;
	category: 'bug' | 'feature-request' | 'ui-issue' | 'performance' | 'other';
	severity: 'low' | 'medium' | 'high' | 'critical';
	screenshotUrls?: string[];
	deviceInfo?: {
		platform: string;
		userAgent: string;
		appVersion?: string;
		screenResolution?: string;
	};
	stepsToReproduce?: string;
	expectedBehavior?: string;
	actualBehavior?: string;
}

export interface BugReportResponse {
	id: string;
	title: string;
	status: 'pending' | 'in-progress' | 'resolved' | 'closed';
	createdAt: string;
}

export const bugReportService = {
	/**
	 * Submit a bug report
	 */
	async submitBugReport(data: BugReportData): Promise<ApiResponse<BugReportResponse>> {
		try {
			const response = await api.post<ApiResponse<BugReportResponse>>('/bug-reports', data);
			return response.data;
		} catch (error: any) {
			logger.error('Error submitting bug report:', error);
			throw error;
		}
	},

	/**
	 * Get user's bug reports
	 */
	async getMyBugReports(page = 1, limit = 10): Promise<ApiResponse<{ items: BugReportResponse[]; pagination: any }>> {
		try {
			const response = await api.get<ApiResponse<{ items: BugReportResponse[]; pagination: any }>>(
				`/bug-reports/me?page=${page}&limit=${limit}`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching bug reports:', error);
			throw error;
		}
	},

	/**
	 * Get a specific bug report
	 */
	async getBugReport(id: string): Promise<ApiResponse<BugReportResponse>> {
		try {
			const response = await api.get<ApiResponse<BugReportResponse>>(`/bug-reports/${id}`);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching bug report:', error);
			throw error;
		}
	},
};


