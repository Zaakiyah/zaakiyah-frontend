import api from '../lib/api';

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface SignupData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	mobileNumber?: string;
	loginPin: string;
	avatarId?: string;
	preferences: string[];
	acceptTerms: boolean;
}

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	avatarUrl?: string;
	mobileNumber?: string;
	address?: string;
	preferences: string[];
	isAdmin: boolean;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
	hasPassword: boolean;
	hasOAuthAccounts: boolean;
	preferredCurrency?: string;
	notificationPreferences?: {
		email: boolean;
		inApp: boolean;
		push: boolean;
		frequency: 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'custom';
		customIntervalMonths?: number;
		notifyRecalculate: boolean;
		notifyZakatDue: boolean;
		notifyNisaabChange: boolean;
		notifySummary: boolean;
		nisaabUpdatesEnabled: boolean;
		communityNotifications?: boolean;
		sendHour: number;
		timezone?: string;
	} | null;
}

export interface LoginResponse {
	user: User;
	accessToken: string;
	requires2FA?: boolean;
	tempToken?: string;
	method?: string;
	emailCodeSent?: boolean;
}

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export const authService = {
	async sendSignupCode(email: string): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/auth/signup-code', {
			email,
		});
		return response.data;
	},

	async verifySignupCode(email: string, code: string): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/auth/signup-code/verify', {
			email,
			code,
		});
		return response.data;
	},

	async signup(data: SignupData): Promise<ApiResponse<LoginResponse>> {
		const response = await api.post<ApiResponse<LoginResponse>>('/auth/signup', data);
		return response.data;
	},

	async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
		const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
		return response.data;
	},

	async verifyLogin2FA(tempToken: string, code: string): Promise<ApiResponse<LoginResponse>> {
		const response = await api.post<ApiResponse<LoginResponse>>('/auth/login/verify-2fa', {
			tempToken,
			code,
		});
		return response.data;
	},

	async forgotPassword(email: string): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/auth/forgot-password', {
			email,
		});
		return response.data;
	},

	async resetPassword(
		email: string,
		otpCode: string,
		password: string,
		confirmPassword: string
	): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/auth/reset-password', {
			email,
			otpCode,
			password,
			confirmPassword,
		});
		return response.data;
	},

	async logout(): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/auth/logout');
		return response.data;
	},

	async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
		const response = await api.post<ApiResponse<{ accessToken: string }>>(
			'/auth/refresh-token'
		);
		return response.data;
	},

	async getProfile(): Promise<ApiResponse<User>> {
		const response = await api.get<ApiResponse<User>>('/me');
		return response.data;
	},

	async updateProfile(data: {
		firstName?: string;
		lastName?: string;
		email?: string;
		mobileNumber?: string;
		address?: string;
		preferredCurrency?: string;
		notificationPreferences?: User['notificationPreferences'];
	}): Promise<ApiResponse<User>> {
		const response = await api.patch<ApiResponse<User>>('/me', data);
		return response.data;
	},

	async updateAvatar(avatarId?: string): Promise<ApiResponse<User>> {
		const response = await api.patch<ApiResponse<User>>('/me', { avatarId });
		return response.data;
	},

	async changePassword(data: {
		currentPassword?: string;
		newPassword: string;
		confirmPassword: string;
	}): Promise<ApiResponse<null>> {
		const response = await api.post<ApiResponse<null>>('/me/change-password', data);
		return response.data;
	},

	async deleteAccount(password?: string): Promise<ApiResponse<null>> {
		const response = await api.delete<ApiResponse<null>>('/me', {
			data: password ? { password } : {},
		});
		return response.data;
	},
};
