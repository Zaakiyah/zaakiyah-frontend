import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { authService } from '../../services/authService';
import BottomSheet from '../ui/BottomSheet';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import Button from '../ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const updateProfileSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email address'),
	mobileNumber: z.string().optional(),
	address: z.string().optional(),
	preferredCurrency: z.string().optional(),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

interface EditProfileSheetProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function EditProfileSheet({ isOpen, onClose }: EditProfileSheetProps) {
	const { user, updateUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { preferredCurrency, setPreferredCurrency } = useCurrencyStore();

	// Memoize default values based on user data
	const defaultValues = useMemo<UpdateProfileFormData>(
		() => ({
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			email: user?.email || '',
			mobileNumber: user?.mobileNumber || '',
			address: user?.address || '',
			preferredCurrency: user?.preferredCurrency || preferredCurrency || 'USD',
		}),
		[user?.firstName, user?.lastName, user?.email, user?.mobileNumber, user?.address, user?.preferredCurrency, preferredCurrency]
	);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues,
	});

	const mobileNumber = watch('mobileNumber');

	// Reset form with user data when sheet opens and fetch latest profile
	useEffect(() => {
		if (isOpen) {
			// Reset error state when opening
			setError(null);
			
			// Populate form with existing user data immediately
			reset(defaultValues);

			// Fetch latest profile data silently in the background
			const fetchProfile = async () => {
				try {
					const response = await authService.getProfile();
					if (response.data) {
					const newData = {
						firstName: response.data.firstName || '',
						lastName: response.data.lastName || '',
						email: response.data.email || '',
						mobileNumber: response.data.mobileNumber || '',
						address: response.data.address || '',
						preferredCurrency: response.data.preferredCurrency || preferredCurrency || 'USD',
					};
					
					// Update currency store if user has preferred currency
					if (response.data.preferredCurrency) {
						setPreferredCurrency(response.data.preferredCurrency);
					}
						
						// Update form only if user hasn't made changes
						reset(newData, { keepDirty: true });
						updateUser(response.data);
					}
				} catch (error) {
					console.error('Failed to fetch profile:', error);
				}
			};

			fetchProfile();
		} else {
			// Reset error state when sheet closes
			setError(null);
		}
	}, [isOpen, reset, updateUser, defaultValues]);

	const onSubmit = async (data: UpdateProfileFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const updateData: {
				firstName?: string;
				lastName?: string;
				email?: string;
				mobileNumber?: string;
				address?: string;
				preferredCurrency?: string;
			} = {};

			// Only include fields that have changed
			if (data.firstName !== user?.firstName) {
				updateData.firstName = data.firstName;
			}
			if (data.lastName !== user?.lastName) {
				updateData.lastName = data.lastName;
			}
			if (data.email !== user?.email) {
				updateData.email = data.email;
			}
			if (data.mobileNumber !== user?.mobileNumber) {
				updateData.mobileNumber = data.mobileNumber || undefined;
			}
			if (data.address !== user?.address) {
				updateData.address = data.address || undefined;
			}
			if (data.preferredCurrency !== (user?.preferredCurrency || preferredCurrency)) {
				updateData.preferredCurrency = data.preferredCurrency;
			}

			// Check if there are any changes
			if (Object.keys(updateData).length === 0) {
				setError('No changes detected');
				setIsLoading(false);
				return;
			}

			const response = await authService.updateProfile(updateData);
			if (response.data) {
				updateUser(response.data);
				onClose();
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to update profile. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Profile">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-4">
				{error && (
						<div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/30 rounded-xl flex items-start justify-between gap-2 shadow-sm">
							<p className="text-sm font-medium text-red-600 dark:text-red-400 flex-1">{error}</p>
							<button
								type="button"
								onClick={() => setError(null)}
								className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
							>
								<XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
							</button>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="First Name"
							placeholder="John"
							error={errors.firstName?.message}
							{...register('firstName')}
						/>
						<Input
							label="Last Name"
							placeholder="Doe"
							error={errors.lastName?.message}
							{...register('lastName')}
						/>
					</div>

					<Input
						label="Email Address"
						type="email"
						placeholder="you@example.com"
						error={errors.email?.message}
						{...register('email')}
					/>

					<PhoneInput
						label="Mobile Number (Optional)"
						value={mobileNumber}
						onChange={(value) => setValue('mobileNumber', value, { shouldValidate: true })}
						error={errors.mobileNumber?.message}
						defaultCountry="NG"
					/>

					<Input
						label="Address (Optional)"
						placeholder="123 Main St, City, State"
						error={errors.address?.message}
						{...register('address')}
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
							Save Changes
						</Button>
					</div>
				</form>
		</BottomSheet>
	);
}

