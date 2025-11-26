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
	createdAt: string;
	updatedAt: string;
}

export interface LoginResponse {
	user: User;
	accessToken: string;
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
};
