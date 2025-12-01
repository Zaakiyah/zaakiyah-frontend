import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import Input from '../components/ui/Input';
import PhoneInput from '../components/ui/PhoneInput';
import Button from '../components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const updateProfileSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email address'),
	mobileNumber: z.string().optional(),
	address: z.string().optional(),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export default function EditProfilePage() {
	const navigate = useNavigate();
	const { user, updateUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isFetchingProfile, setIsFetchingProfile] = useState(true);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			email: user?.email || '',
			mobileNumber: user?.mobileNumber || '',
			address: user?.address || '',
		},
	});

	const mobileNumber = watch('mobileNumber');

	// Fetch latest profile data
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await authService.getProfile();
				if (response.data) {
					setValue('firstName', response.data.firstName);
					setValue('lastName', response.data.lastName);
					setValue('email', response.data.email);
					setValue('mobileNumber', response.data.mobileNumber || '');
					setValue('address', response.data.address || '');
					updateUser(response.data);
				}
			} catch (error) {
				console.error('Failed to fetch profile:', error);
			} finally {
				setIsFetchingProfile(false);
			}
		};

		fetchProfile();
	}, [setValue, updateUser]);

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

			// Check if there are any changes
			if (Object.keys(updateData).length === 0) {
				setError('No changes detected');
				setIsLoading(false);
				return;
			}

			const response = await authService.updateProfile(updateData);
			if (response.data) {
				updateUser(response.data);
				navigate('/profile', { replace: true });
			}
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message || 'Failed to update profile. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetchingProfile) {
		return (
			<div className="min-h-screen bg-slate-50 pb-20">
				<PageHeader title="Edit Profile" showBack />
				<main className="px-4 py-4">
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60"
							>
								<div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
							</div>
						))}
					</div>
				</main>
				<BottomNavigation />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			<PageHeader title="Edit Profile" showBack />

			<main className="px-4 py-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4"
				>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-start justify-between gap-2"
						>
							<p className="text-sm text-error-600 flex-1">{error}</p>
							<button
								onClick={() => setError(null)}
								className="p-1 rounded-lg hover:bg-error-100 transition-colors"
							>
								<XMarkIcon className="w-4 h-4 text-error-600" />
							</button>
						</motion.div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
								onClick={() => navigate('/profile')}
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
				</motion.div>
			</main>

			<BottomNavigation />
		</div>
	);
}

