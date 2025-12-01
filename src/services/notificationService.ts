import api from '../lib/api';
import type { PaginationMetadata } from './nisaabService';

export interface Notification {
	id: string;
	title: string;
	message: string | null;
	metadata: Record<string, any> | null;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedNotifications {
	items: Notification[];
	pagination: PaginationMetadata;
}

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export interface UnreadCountResponse {
	count: number;
}

export const notificationService = {
	async getNotifications(
		page = 1,
		limit = 30,
		options?: {
			search?: string;
			onlyUnread?: boolean;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
		}
	): Promise<ApiResponse<PaginatedNotifications>> {
		const params: Record<string, any> = { page, limit };
		if (options?.search) params.search = options.search;
		if (options?.onlyUnread) params.onlyUnread = options.onlyUnread;
		if (options?.sortBy) params.sortBy = options.sortBy;
		if (options?.sortOrder) params.sortOrder = options.sortOrder;

		const response = await api.get<ApiResponse<PaginatedNotifications>>('/notifications/in-app/me', {
			params,
		});
		return response.data;
	},

	async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
		const response = await api.patch<ApiResponse<void>>(`/notifications/in-app/mark-as-read/${notificationId}`);
		return response.data;
	},

	async markAllAsRead(): Promise<ApiResponse<void>> {
		const response = await api.patch<ApiResponse<void>>('/notifications/in-app/mark-all-as-read');
		return response.data;
	},

	async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
		const response = await api.get<ApiResponse<UnreadCountResponse>>('/notifications/in-app/unread-count');
		return response.data;
	},
};

