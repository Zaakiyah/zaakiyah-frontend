import api from '../lib/api';

export enum TwoFactorMethod {
	EMAIL = 'EMAIL',
	TOTP = 'TOTP',
}

export interface Setup2FAResponse {
	message: string;
	method: TwoFactorMethod;
	emailCodeSent?: boolean;
	qrCode?: string;
	secret?: string;
	recoveryCode?: string;
	warning?: string;
}

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data?: T;
}

export interface TwoFAStatusResponse {
	enabled: boolean;
	method: TwoFactorMethod | null;
}

export const twoFactorService = {
	async getStatus(): Promise<ApiResponse<TwoFAStatusResponse>> {
		const response = await api.get<ApiResponse<TwoFAStatusResponse>>('/2fa/status');
		return response.data;
	},

	async setup2FA(method: TwoFactorMethod): Promise<ApiResponse<Setup2FAResponse>> {
		const response = await api.post<ApiResponse<Setup2FAResponse>>('/2fa/setup', {
			method,
		});
		return response.data;
	},

	async verify2FA(
		code: string,
		method: TwoFactorMethod
	): Promise<ApiResponse<{ method: TwoFactorMethod }>> {
		const response = await api.post<ApiResponse<{ method: TwoFactorMethod }>>('/2fa/verify', {
			code,
			method,
		});
		return response.data;
	},

	async resendEmailCode(): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/2fa/resend-code');
		return response.data;
	},

	async disable2FA(): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/2fa/disable');
		return response.data;
	},

	async recoverWithCode(recoveryCode: string): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/2fa/recover', {
			recoveryCode,
		});
		return response.data;
	},
};
