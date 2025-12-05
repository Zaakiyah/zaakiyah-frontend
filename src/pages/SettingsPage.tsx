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
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			<PageHeader title="Settings" showBack />

			<main className="px-4 py-4 space-y-4">
				{/* Currency Preference Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
							<CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
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
					<CurrencySelector
						value={preferredCurrency || user?.preferredCurrency || 'USD'}
						onChange={handleCurrencyChange}
						disabled={isUpdatingCurrency}
					/>
					{isUpdatingCurrency && (
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
							Updating currency preference...
						</p>
					)}
				</motion.div>

				{/* Additional Settings Sections - Placeholder for future features */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
							<BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
						</div>
						<div className="flex-1">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
								Notification Preferences
							</h2>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Manage how and when you receive notifications
							</p>
						</div>
					</div>
					<ComingSoon variant="section" />
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
							<LanguageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
				>
					<div className="flex items-start gap-3 mb-4">
						<div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
							<MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
