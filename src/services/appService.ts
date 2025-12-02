import api from '../lib/api';

export interface AppVersion {
	version: string;
	name: string;
}

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export const appService = {
	getVersion: async (): Promise<AppVersion> => {
		const response = await api.get<ApiResponse<AppVersion>>('/version');
		// Response is wrapped by the interceptor: { message, statusCode, data }
		return response.data.data;
	},
};

