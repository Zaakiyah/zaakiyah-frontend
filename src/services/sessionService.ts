import api from '../lib/api';

export interface Session {
	id: string;
	userId: string;
	deviceName: string | null;
	location: string | null;
	userAgent: string | null;
	ipAddress: string | null;
	createdAt: string;
	expiresAt: string;
	formattedTime: string;
}

export interface PaginationMetadata {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
}

export interface PaginatedSessions {
	items: Session[];
	pagination: PaginationMetadata;
}

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export const sessionService = {
	async getSessions(page = 1, limit = 20): Promise<ApiResponse<PaginatedSessions>> {
		const response = await api.get<ApiResponse<PaginatedSessions>>('/session', {
			params: { page, limit },
		});
		return response.data;
	},

	async deleteSession(sessionId: string): Promise<ApiResponse<null>> {
		const response = await api.delete<ApiResponse<null>>(`/session/${sessionId}`);
		return response.data;
	},

	async deleteAllSessions(): Promise<ApiResponse<{ deletedCount: number }>> {
		const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/session');
		return response.data;
	},
};

