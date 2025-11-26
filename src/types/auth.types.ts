import { z } from 'zod';
import {
	loginSchema,
	signupSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} from '../schemas/auth.schemas';

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const PREFERENCES = [
	'Give Zakaat',
	'Calculate Wealth',
	'Take Zakaat',
	'Join the community',
	'Others',
] as const;

export type Preference = (typeof PREFERENCES)[number];

