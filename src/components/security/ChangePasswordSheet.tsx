import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import BottomSheet from '../ui/BottomSheet';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const changePasswordSchema = z
	.object({
		currentPassword: z.string().optional(),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number')
			.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordSheetProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function ChangePasswordSheet({
	isOpen,
	onClose,
	onSuccess,
}: ChangePasswordSheetProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const user = useAuthStore((state) => state.user);
	const [hasPassword, setHasPassword] = useState(true);

	useEffect(() => {
		if (isOpen && user) {
			// Fetch latest profile to get auth info
			authService
				.getProfile()
				.then((response) => {
					if (response.data) {
						setHasPassword(response.data.hasPassword ?? true);
						// Update user in store
						useAuthStore.getState().updateUser(response.data);
					}
				})
				.catch(() => {
					// Fallback to user from store
					setHasPassword(user.hasPassword ?? true);
				});
		}
	}, [isOpen, user]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
		},
	});

	const onSubmit = async (data: ChangePasswordFormData) => {
		// If user has password, current password is required
		if (hasPassword && !data.currentPassword?.trim()) {
			setError('Current password is required');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await authService.changePassword({
				currentPassword: hasPassword ? data.currentPassword : undefined,
				newPassword: data.newPassword,
				confirmPassword: data.confirmPassword,
			});
			reset();
			onSuccess?.();
			onClose();
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to change password. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={onClose}
			title={hasPassword ? 'Change Password' : 'Set Password'}
		>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
				{error && (
					<div className="p-3 bg-error-50 border border-error-200 rounded-lg flex items-start justify-between gap-2">
						<p className="text-sm text-error-600 flex-1">{error}</p>
						<button
							type="button"
							onClick={() => setError(null)}
							className="p-1 rounded-lg hover:bg-error-100 transition-colors"
						>
							<XMarkIcon className="w-4 h-4 text-error-600" />
						</button>
					</div>
				)}

				{!hasPassword && (
					<div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
						<p className="text-sm text-primary-700">
							You don't have a password set. Create one to enable password login in addition to your OAuth login.
						</p>
					</div>
				)}

				{hasPassword && (
					<PasswordInput
						label="Current Password"
						placeholder="Enter your current password"
						error={errors.currentPassword?.message}
						{...register('currentPassword')}
					/>
				)}

				<PasswordInput
					label={hasPassword ? 'New Password' : 'Password'}
					placeholder={hasPassword ? 'Enter your new password' : 'Enter your password'}
					error={errors.newPassword?.message}
					{...register('newPassword')}
				/>

				<PasswordInput
					label={hasPassword ? 'Confirm New Password' : 'Confirm Password'}
					placeholder={
						hasPassword ? 'Confirm your new password' : 'Confirm your password'
					}
					error={errors.confirmPassword?.message}
					{...register('confirmPassword')}
				/>

				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="flex-1"
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
						{hasPassword ? 'Change Password' : 'Set Password'}
					</Button>
				</div>
			</form>
		</BottomSheet>
	);
}

