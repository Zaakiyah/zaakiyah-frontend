import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { deviceService } from '../services/deviceService';
import BottomNavigation from '../components/layout/BottomNavigation';
import EditProfileSheet from '../components/profile/EditProfileSheet';
import AvatarEditSheet from '../components/profile/AvatarEditSheet';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
	EnvelopeIcon,
	PhoneIcon,
	ArrowRightOnRectangleIcon,
	Cog6ToothIcon,
	ShieldCheckIcon,
	BellIcon,
	QuestionMarkCircleIcon,
	DocumentTextIcon,
	ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user, clearAuth } = useAuthStore();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
	const [isAvatarEditSheetOpen, setIsAvatarEditSheetOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

	const handleLogoutConfirm = async () => {
		setIsLoggingOut(true);

		try {
			deviceService.clearDeviceInfo();
			await authService.logout();
			clearAuth();
			navigate('/login', { replace: true });
		} catch (error) {
			console.error('Error logging out:', error);
			clearAuth();
			navigate('/login', { replace: true });
		} finally {
			setIsLoggingOut(false);
		}
	};

	const WEBSITE_URL = 'https://zaakiyah.com';

	const menuItems = [
		{
			icon: BellIcon,
			label: 'Notifications',
			onClick: () => navigate('/notifications'),
		},
		{
			icon: ShieldCheckIcon,
			label: 'Security & Privacy',
			onClick: () => navigate('/security'),
		},
		{
			icon: Cog6ToothIcon,
			label: 'Settings',
			onClick: () => navigate('/settings'),
		},
		{
			icon: QuestionMarkCircleIcon,
			label: 'Help & Support',
			onClick: () => window.open(`${WEBSITE_URL}/help`, '_blank', 'noopener,noreferrer'),
		},
		{
			icon: DocumentTextIcon,
			label: 'Terms & Privacy',
			onClick: () => navigate('/terms'),
		},
	];

	return (
		<div className="min-h-screen bg-slate-50 pb-20">
			{/* Compact Header */}
			<header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<h1 className="text-lg font-bold text-slate-900">Profile</h1>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4 space-y-4">
				{/* Compact Profile Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60"
				>
					<div className="flex flex-col items-center text-center mb-4">
						{/* Avatar */}
						<div className="relative mb-3">
							{user?.avatarUrl ? (
								<img
									src={user.avatarUrl}
									alt={`${user.firstName} ${user.lastName}`}
									className="w-20 h-20 rounded-full object-cover ring-2 ring-primary-100 shadow-md"
								/>
							) : (
								<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-primary-100 shadow-md">
									<span className="text-3xl font-bold text-white">
										{user?.firstName?.[0]?.toUpperCase() || 'U'}
									</span>
								</div>
							)}
							{/* Edit avatar button */}
							<button
								onClick={() => setIsAvatarEditSheetOpen(true)}
								className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors active:scale-95"
								title="Change avatar"
							>
								<svg
									className="w-3.5 h-3.5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 4.732z"
									/>
								</svg>
							</button>
						</div>

						{/* Name */}
						<h2 className="text-xl font-bold text-slate-900 mb-0.5">
							{user?.firstName} {user?.lastName}
						</h2>

						{/* Email */}
						{user?.email && (
							<div className="flex items-center justify-center gap-1.5 text-slate-600 mb-3">
								<EnvelopeIcon className="w-3.5 h-3.5" />
								<span className="text-xs">{user.email}</span>
							</div>
						)}
					</div>

					{/* User Info */}
					<div className="space-y-2 border-t border-slate-200 pt-3">
						{user?.mobileNumber && (
							<div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/50">
								<div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
									<PhoneIcon className="w-4.5 h-4.5 text-slate-600" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-slate-500 mb-0.5">Phone Number</p>
									<p className="text-sm font-medium text-slate-900">
										{user.mobileNumber}
									</p>
								</div>
							</div>
						)}

						{user?.email && (
							<div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/50">
								<div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
									<EnvelopeIcon className="w-4.5 h-4.5 text-slate-600" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-slate-500 mb-0.5">Email Address</p>
									<p className="text-sm font-medium text-slate-900 truncate">
										{user.email}
									</p>
								</div>
							</div>
						)}

						{user?.address && (
							<div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/50">
								<div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
									<svg
										className="w-4.5 h-4.5 text-slate-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-slate-500 mb-0.5">Address</p>
									<p className="text-sm font-medium text-slate-900">{user.address}</p>
								</div>
							</div>
						)}

						<button
							onClick={() => setIsEditSheetOpen(true)}
							className="w-full flex items-center justify-center gap-2 p-3 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors active:scale-[0.98] mt-2"
						>
							<svg
								className="w-4 h-4 text-primary-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 4.732z"
								/>
							</svg>
							<span className="text-sm font-semibold text-primary-600">Edit Profile</span>
						</button>
					</div>
				</motion.div>

				{/* Compact Menu Items */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden"
				>
					{menuItems.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.label}
								onClick={item.onClick}
								className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors active:scale-[0.98] border-b border-slate-200/60 last:border-b-0"
							>
								<div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<Icon className="w-5 h-5 text-slate-700" />
								</div>
								<div className="flex-1 text-left">
									<p className="text-sm font-semibold text-slate-900">
										{item.label}
									</p>
								</div>
								<ArrowRightIcon className="w-4 h-4 text-slate-400" />
							</button>
						);
					})}
				</motion.div>

				{/* Compact Logout Button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<button
						onClick={() => setIsLogoutDialogOpen(true)}
						disabled={isLoggingOut}
						className="w-full flex items-center justify-center gap-2 p-3 bg-error-50 hover:bg-error-100 active:bg-error-200 rounded-xl border border-error-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ArrowRightOnRectangleIcon className="w-5 h-5 text-error-600" />
						<span className="text-sm font-semibold text-error-600">
							{isLoggingOut ? 'Signing out...' : 'Sign Out'}
						</span>
					</button>
				</motion.div>

				{/* App Version / Footer */}
				<div className="text-center py-3">
					<p className="text-xs text-slate-400">Zaakiyah v1.0.0</p>
				</div>
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />

			{/* Edit Profile Sheet */}
			<EditProfileSheet isOpen={isEditSheetOpen} onClose={() => setIsEditSheetOpen(false)} />

			{/* Avatar Edit Sheet */}
			<AvatarEditSheet
				isOpen={isAvatarEditSheetOpen}
				onClose={() => setIsAvatarEditSheetOpen(false)}
			/>

			{/* Logout Confirmation Dialog */}
			<ConfirmDialog
				isOpen={isLogoutDialogOpen}
				onClose={() => setIsLogoutDialogOpen(false)}
				onConfirm={handleLogoutConfirm}
				title="Sign Out"
				message="Are you sure you want to sign out of your account?"
				variant="warning"
				confirmText="Sign Out"
				cancelText="Cancel"
				isLoading={isLoggingOut}
			/>
		</div>
	);
}
