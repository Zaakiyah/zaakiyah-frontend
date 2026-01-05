import api from '../lib/api';
import { logger } from '../utils/logger';

interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export interface AuditLog {
	id: string;
	userId?: string;
	action: string;
	resourceType?: string;
	resourceId?: string;
	targetUserId?: string;
	severity: 'info' | 'warning' | 'error' | 'critical';
	ipAddress?: string;
	userAgent?: string;
	details?: Record<string, any>;
	metadata?: Record<string, any>;
	createdAt: string;
	user?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	targetUser?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
}

export interface AuditLogQueryParams {
	page?: number;
	limit?: number;
	action?: string;
	resourceType?: string;
	resourceId?: string;
	severity?: 'info' | 'warning' | 'error' | 'critical';
	userId?: string;
	targetUserId?: string;
	startDate?: string;
	endDate?: string;
}

export interface PaginatedAuditLogs {
	items: AuditLog[];
	pagination: {
		totalItems: number;
		currentPage: number;
		itemsPerPage: number;
		totalPages: number;
	};
}

export const auditLogService = {
	/**
	 * Get current user's audit logs (important activities only)
	 */
	async getMyAuditLogs(
		params?: AuditLogQueryParams
	): Promise<ApiResponse<PaginatedAuditLogs>> {
		try {
			const response = await api.get<ApiResponse<PaginatedAuditLogs>>(
				'/audit-logs/me',
				{ params }
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching user audit logs:', error);
			throw error;
		}
	},

	/**
	 * Get all audit logs (admin only)
	 */
	async getAllAuditLogs(
		params?: AuditLogQueryParams
	): Promise<ApiResponse<PaginatedAuditLogs>> {
		try {
			const response = await api.get<ApiResponse<PaginatedAuditLogs>>(
				'/audit-logs',
				{ params }
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching audit logs:', error);
			throw error;
		}
	},

	/**
	 * Export current user's audit logs as CSV
	 */
	async exportMyAuditLogs(
		params?: AuditLogQueryParams
	): Promise<Blob> {
		try {
			const queryParams = new URLSearchParams();
			if (params?.action) queryParams.append('action', params.action);
			if (params?.resourceType) queryParams.append('resourceType', params.resourceType);
			if (params?.severity) queryParams.append('severity', params.severity);
			if (params?.startDate) queryParams.append('startDate', params.startDate);
			if (params?.endDate) queryParams.append('endDate', params.endDate);

			const response = await api.get(`/audit-logs/me/export?${queryParams.toString()}`, {
				responseType: 'blob',
			});
			return response.data;
		} catch (error: any) {
			logger.error('Error exporting user audit logs:', error);
			throw error;
		}
	},
};

