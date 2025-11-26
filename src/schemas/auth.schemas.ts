import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required'),
	rememberMe: z.boolean().optional(),
});

export const signupSchema = z
	.object({
		firstName: z.string().min(2, 'First name must be at least 2 characters'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
				'Password must contain uppercase, lowercase, number, and symbol'
			),
		confirmPassword: z.string(),
		mobileNumber: z.string().optional(),
		loginPin: z
			.string()
			.length(4, 'PIN must be exactly 4 digits')
			.regex(/^\d+$/, 'PIN must contain only numbers')
			.refine((pin) => !/(\d)\1{3}/.test(pin), 'PIN cannot have repeated numbers like 1111'),
		preferences: z.array(z.string()).min(1, 'Select at least one preference'),
		acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export const forgotPasswordSchema = z.object({
	email: z.email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
	.object({
		email: z.email('Please enter a valid email address'),
		otpCode: z.string().min(4, 'OTP code is required'),
		password: z
			.string()
			.min(6, 'Password must be at least 6 characters')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
				'Password must contain uppercase, lowercase, number, and symbol'
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

