import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useCurrencyStore } from '../store/currencyStore';
import { wealthCalculationService } from '../services/wealthCalculationService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import CurrencyDisplay from '../components/wealth/CurrencyDisplay';
import {
	ArrowLeftIcon,
	BanknotesIcon,
	ChartBarIcon,
	XCircleIcon,
	CalculatorIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { WealthCalculation } from '../types/wealth.types';

export default function CalculationDetailsPage() {
	useTheme();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { preferredCurrency } = useCurrencyStore();
	const [calculation, setCalculation] = useState<WealthCalculation | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchCalculation = async () => {
			if (!id) return;

			setIsLoading(true);
			try {
				const response = await wealthCalculationService.getCalculationById(id);
				if (response?.data) {
					setCalculation(response.data);
				}
			} catch (error) {
				logger.error('Error fetching calculation:', error);
				alert.error('Failed to load calculation. Please try again.');
				navigate('/calculations');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCalculation();
	}, [id, navigate]);

	const formatDate = (dateString: string | Date) => {
		const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
				<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-sm">
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate('/calculations')}
								className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all"
								type="button"
							>
								<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
							</button>
							<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
						</div>
					</div>
				</header>
				<main className="px-4 py-4">
					<LoadingSkeleton type="card" count={3} />
				</main>
			</div>
		);
	}

	if (!calculation) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
				<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-sm">
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate('/calculations')}
								className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all"
								type="button"
							>
								<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
							</button>
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Calculation Not Found
							</h1>
						</div>
					</div>
				</header>
				<main className="px-4 py-4">
					<div className="text-center py-12">
						<p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
							The calculation you're looking for doesn't exist or has been deleted.
						</p>
						<Button onClick={() => navigate('/calculations')} variant="primary">
							Back to Calculations
						</Button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate('/calculations')}
							className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all active:scale-95"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<div className="flex-1">
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								{calculation.name || 'Calculation Details'}
							</h1>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{formatDate(calculation.calculationDate)}
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4 space-y-4">
				{/* Status Card */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className={`relative p-6 rounded-2xl border-2 overflow-hidden ${
						calculation.meetsNisaab
							? 'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/20 border-success-300 dark:border-success-700'
							: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-600'
					}`}
				>
					{/* Decorative gradient overlay */}
					{calculation.meetsNisaab && (
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-success-500/10 via-success-400/10 to-success-300/5 rounded-full blur-2xl -z-0" />
					)}
					<div className="flex items-center gap-3 mb-4 relative z-10">
						{calculation.meetsNisaab ? (
							<CheckCircleIconSolid className="w-8 h-8 text-success-600 dark:text-success-400" />
						) : (
							<XCircleIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
						)}
						<div className="flex-1">
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								{calculation.meetsNisaab ? 'Zakaat is Due' : 'Zakaat Not Due'}
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								Based on {calculation.nisaabBase === 'gold' ? 'Gold' : 'Silver'}{' '}
								Nisaab
							</p>
						</div>
					</div>

					{calculation.meetsNisaab &&
						calculation.zakatDue !== null &&
						calculation.zakatDue !== undefined && (
							<div className="mt-4 pt-4 border-t-2 border-success-200 dark:border-success-800 relative z-10">
								<div className="flex flex-col gap-2">
									<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Zakaat Due ({calculation.zakatRate || 2.5}%):
									</span>
									<CurrencyDisplay
										amount={calculation.zakatDue}
										originalCurrency={
											calculation.currency || preferredCurrency || 'USD'
										}
										preferredCurrency={preferredCurrency || 'USD'}
										size="lg"
										variant="success"
									/>
								</div>
							</div>
						)}
				</motion.div>

				{/* Breakdown */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 space-y-4 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
					<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 relative z-10">
						Calculation Breakdown
					</h3>

					{/* Assets */}
					<div className="p-4 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/20 rounded-xl border-2 border-success-200 dark:border-success-800 shadow-sm relative z-10">
						<div className="flex items-center gap-3 mb-2">
							<BanknotesIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
							<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Total Assets
							</h4>
						</div>
						<CurrencyDisplay
							amount={calculation.totalAssets || 0}
							originalCurrency={calculation.currency || preferredCurrency || 'USD'}
							preferredCurrency={preferredCurrency || 'USD'}
							size="lg"
							variant="success"
						/>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
							{Array.isArray(calculation.assets) ? calculation.assets.length : 0}{' '}
							asset
							{Array.isArray(calculation.assets) && calculation.assets.length !== 1
								? 's'
								: ''}
						</p>
					</div>

					{/* Liabilities */}
					<div className="p-4 bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900/30 dark:to-error-800/20 rounded-xl border-2 border-error-200 dark:border-error-800 shadow-sm relative z-10">
						<div className="flex items-center gap-3 mb-2">
							<ChartBarIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
							<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Total Liabilities
							</h4>
						</div>
						<CurrencyDisplay
							amount={calculation.totalLiabilities || 0}
							originalCurrency={calculation.currency || preferredCurrency || 'USD'}
							preferredCurrency={preferredCurrency || 'USD'}
							size="lg"
							variant="error"
						/>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
							{Array.isArray(calculation.liabilities)
								? calculation.liabilities.length
								: 0}{' '}
							liability
							{Array.isArray(calculation.liabilities) &&
							calculation.liabilities.length !== 1
								? 'ies'
								: ''}
						</p>
					</div>

					{/* Net Worth */}
					<div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 shadow-sm relative z-10">
						<div className="flex items-center gap-3 mb-2">
							<CalculatorIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
							<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Net Worth
							</h4>
						</div>
						<CurrencyDisplay
							amount={calculation.netWorth || 0}
							originalCurrency={calculation.currency || preferredCurrency || 'USD'}
							preferredCurrency={preferredCurrency || 'USD'}
							size="lg"
							variant="primary"
						/>
					</div>
				</motion.div>

				{/* Nisaab Info */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
					<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3 relative z-10">
						Nisaab Information
					</h3>
					<div className="space-y-2 relative z-10">
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">
								Base Used:
							</span>
							<span className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
								{calculation.nisaabBase}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">
								Threshold:
							</span>
							<CurrencyDisplay
								amount={calculation.nisaabThreshold || 0}
								originalCurrency={
									calculation.currency || preferredCurrency || 'USD'
								}
								preferredCurrency={preferredCurrency || 'USD'}
								size="sm"
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">
								Gold Nisaab:
							</span>
							<CurrencyDisplay
								amount={calculation.goldNisaabValue || 0}
								originalCurrency={
									calculation.currency || preferredCurrency || 'USD'
								}
								preferredCurrency={preferredCurrency || 'USD'}
								size="sm"
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">
								Silver Nisaab:
							</span>
							<CurrencyDisplay
								amount={calculation.silverNisaabValue || 0}
								originalCurrency={
									calculation.currency || preferredCurrency || 'USD'
								}
								preferredCurrency={preferredCurrency || 'USD'}
								size="sm"
							/>
						</div>
					</div>
				</motion.div>

				{/* Notification Preferences */}
				{calculation.notificationEnabled && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
						className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
					>
						{/* Decorative gradient overlay */}
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
						<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3 relative z-10">
							Notification Preferences
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">
									Frequency:
								</span>
								<span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
									{calculation.notificationFrequency || 'Not set'}
								</span>
							</div>
							{calculation.nextNotificationDate && (
								<div className="flex items-center justify-between">
									<span className="text-slate-600 dark:text-slate-400">
										Next Notification:
									</span>
									<span className="font-semibold text-slate-900 dark:text-slate-100">
										{formatDate(calculation.nextNotificationDate)}
									</span>
								</div>
							)}
						</div>
					</motion.div>
				)}

				{/* Actions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="flex gap-3 pt-2"
				>
					<Button
						variant="outline"
						onClick={() => navigate('/calculate')}
						className="flex-1"
					>
						Recalculate
					</Button>
					<Button
						variant="primary"
						onClick={() => navigate('/donations')}
						className="flex-1"
					>
						Give Zakaat
					</Button>
				</motion.div>
			</main>

			<BottomNavigation />
		</div>
	);
}
