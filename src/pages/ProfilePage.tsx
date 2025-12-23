import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/authService';
import { deviceService } from '../services/deviceService';
import { appService } from '../services/appService';
import BottomNavigation from '../components/layout/BottomNavigation';
import EditProfileSheet from '../components/profile/EditProfileSheet';
import AvatarEditSheet from '../components/profile/AvatarEditSheet';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { WEBSITE_PAGES } from '../config/website';
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
	UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user, clearAuth } = useAuthStore();
	useTheme();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
	const [isAvatarEditSheetOpen, setIsAvatarEditSheetOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [appVersion, setAppVersion] = useState<string>('1.0.0');

	useEffect(() => {
		const fetchAppVersion = async () => {
			try {
				const versionInfo = await appService.getVersion();
				setAppVersion(versionInfo.version);
			} catch (error) {
				console.error('Failed to fetch app version:', error);
				// Keep default version on error
			}
		};

		fetchAppVersion();
	}, []);

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
			onClick: () => window.open(WEBSITE_PAGES.HELP, '_blank', 'noopener,noreferrer'),
		},
		{
			icon: DocumentTextIcon,
			label: 'Terms & Privacy',
			onClick: () => window.open(WEBSITE_PAGES.TERMS, '_blank', 'noopener,noreferrer'),
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			{/* Compact Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-lg">
				<div className="px-4 py-3.5">
					<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Profile</h1>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4 space-y-4">
				{/* Compact Profile Card */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-3xl -z-0" />
					<div className="flex flex-col items-center text-center mb-4 relative z-10">
						{/* Avatar */}
						<div className="relative mb-3">
							{user?.avatarUrl ? (
								<img
									src={user.avatarUrl}
									alt={`${user.firstName} ${user.lastName}`}
									className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-200 dark:ring-primary-800 shadow-lg"
								/>
							) : (
								<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center ring-4 ring-primary-200 dark:ring-primary-800 shadow-lg shadow-primary-500/30 dark:shadow-primary-600/30">
									<span className="text-3xl font-bold text-white">
										{user?.firstName?.[0]?.toUpperCase() || 'U'}
									</span>
								</div>
							)}
							{/* Edit avatar button */}
							<button
								onClick={() => setIsAvatarEditSheetOpen(true)}
								className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95"
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

						{/* Name with badges */}
						<div className="flex items-center justify-center gap-2 mb-0.5">
							<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
								{user?.firstName} {user?.lastName}
							</h2>
							{/* Badges next to name */}
							{user?.isAdmin && (
								<div className="flex items-center" title="Admin">
									<ShieldCheckIcon className="w-5 h-5 text-amber-500" />
								</div>
							)}
							{user?.isVerified && !user?.isAdmin && (
								<div className="flex items-center" title="Verified">
									<CheckBadgeIcon className="w-5 h-5 text-primary-500" />
								</div>
							)}
						</div>

						{/* Email */}
						{user?.email && (
							<div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 mb-3">
								<EnvelopeIcon className="w-3.5 h-3.5" />
								<span className="text-xs">{user.email}</span>
							</div>
						)}
					</div>

					{/* User Info */}
					<div className="space-y-3 border-t-2 border-slate-200/60 dark:border-slate-700/60 pt-4 relative z-10">
						{user?.mobileNumber && (
							<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 shadow-sm">
								<div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
									<PhoneIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Phone Number</p>
									<p className="text-sm font-medium text-slate-900 dark:text-slate-100">
										{user.mobileNumber}
									</p>
								</div>
							</div>
						)}

						{user?.email && (
							<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 shadow-sm">
								<div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
									<EnvelopeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Email Address</p>
									<p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
										{user.email}
									</p>
								</div>
							</div>
						)}

						{user?.address && (
							<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 shadow-sm">
								<div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
									<svg
										className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300"
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
									<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Address</p>
									<p className="text-sm font-medium text-slate-900 dark:text-slate-100">
										{user.address}
									</p>
								</div>
							</div>
						)}

						{/* Community Profile Link */}
						{user?.id && (
							<button
								onClick={() => navigate(`/community/members/${user.id}`)}
								className="w-full flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700/70 dark:hover:to-slate-800/70 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-3"
							>
								<UserGroupIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
								<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
									View Community Profile
								</span>
								<ArrowRightIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
							</button>
						)}

						<button
							onClick={() => setIsEditSheetOpen(true)}
							className="w-full flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-800/40 dark:hover:to-primary-700/30 rounded-xl border-2 border-primary-200 dark:border-primary-800/30 transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-3"
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
							<span className="text-sm font-semibold text-primary-600">
								Edit Profile
							</span>
						</button>
					</div>
				</motion.div>

				{/* Compact Menu Items */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
					
					{menuItems.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.label}
								onClick={item.onClick}
								className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all active:scale-[0.98] border-b-2 border-slate-200/60 dark:border-slate-700/60 last:border-b-0 relative z-10"
							>
								<div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
									<Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
								</div>
								<div className="flex-1 text-left">
									<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
										{item.label}
									</p>
								</div>
								<ArrowRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
							</button>
						);
					})}
				</motion.div>

				{/* Compact Logout Button */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
				>
					<button
						onClick={() => setIsLogoutDialogOpen(true)}
						disabled={isLoggingOut}
						className="w-full flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/40 dark:hover:to-red-700/30 active:from-red-200 active:to-red-300 rounded-xl border-2 border-red-200 dark:border-red-800/30 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ArrowRightOnRectangleIcon className="w-5 h-5 text-error-600" />
						<span className="text-sm font-semibold text-error-600">
							{isLoggingOut ? 'Signing out...' : 'Sign Out'}
						</span>
					</button>
				</motion.div>

				{/* App Version / Footer */}
				<div className="text-center py-3">
					<p className="text-xs text-slate-400 dark:text-slate-500">Zaakiyah v{appVersion}</p>
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
