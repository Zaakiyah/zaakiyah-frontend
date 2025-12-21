import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/authService';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
import CurrencySelector from '../components/ui/CurrencySelector';
import { CurrencyDollarIcon, BellIcon, LanguageIcon, MoonIcon } from '@heroicons/react/24/outline';
import ThemeSelector from '../components/ui/ThemeSelector';
import ComingSoon from '../components/ui/ComingSoon';
import NotificationPreferencesSection from '../components/settings/NotificationPreferencesSection';

export default function SettingsPage() {
	const { user, updateUser } = useAuthStore();
	const {
		preferredCurrency,
		setPreferredCurrency,
		fetchSupportedCurrencies,
		syncWithUserProfile,
	} = useCurrencyStore();
	useTheme();
	const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);

	useEffect(() => {
		syncWithUserProfile();
		fetchSupportedCurrencies();
	}, [syncWithUserProfile, fetchSupportedCurrencies]);

	const handleCurrencyChange = async (currency: string) => {
		setIsUpdatingCurrency(true);
		try {
			// Update in store immediately for UI responsiveness
			setPreferredCurrency(currency);

			// Update on backend
			const response = await authService.updateProfile({
				preferredCurrency: currency,
			});

			if (response.data) {
				updateUser(response.data);
			}
		} catch (error: any) {
			console.error('Failed to update currency preference:', error);
			// Revert to previous currency on error
			syncWithUserProfile();
		} finally {
			setIsUpdatingCurrency(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			<PageHeader title="Settings" showBack />

			<main className="px-4 py-4 space-y-4">
				{/* Currency Preference Section */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-visible"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<CurrencyDollarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
								Preferred Currency
							</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Choose your preferred currency for displaying amounts throughout the
								app. All monetary values will be converted and displayed in this
								currency.
							</p>
						</div>
					</div>
					<div className="relative z-10">
						<CurrencySelector
							value={preferredCurrency || user?.preferredCurrency || 'USD'}
							onChange={handleCurrencyChange}
							disabled={isUpdatingCurrency}
						/>
					</div>
					{isUpdatingCurrency && (
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
							Updating currency preference...
						</p>
					)}
				</motion.div>

				{/* Notification Preferences Section */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-visible"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<BellIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
								Notification Preferences
							</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Manage how and when you receive notifications. These settings will be used as defaults for new calculations.
							</p>
						</div>
					</div>
					<NotificationPreferencesSection />
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 via-slate-400/5 to-slate-300/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<LanguageIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
								Language
							</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Choose your preferred language for the app interface
							</p>
						</div>
					</div>
					<ComingSoon variant="section" />
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 via-slate-400/5 to-slate-300/5 rounded-full blur-2xl -z-0" />
					
					<div className="flex items-start gap-3 mb-4 relative z-10">
						<div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
							<MoonIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
								Appearance
							</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Customize the look and feel of the app. Choose between light, dark,
								or match your device settings.
							</p>
						</div>
					</div>
					<ThemeSelector />
				</motion.div>
			</main>

			<BottomNavigation />
		</div>
	);
}
