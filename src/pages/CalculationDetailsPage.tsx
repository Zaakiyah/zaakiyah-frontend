import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useCurrencyStore } from '../store/currencyStore';
import { wealthCalculationService } from '../services/wealthCalculationService';
import { formatCurrency } from '../utils/currency';
import { alert } from '../store/alertStore';
import BottomNavigation from '../components/layout/BottomNavigation';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
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
				console.error('Error fetching calculation:', error);
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
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
				<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate('/calculations')}
								className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
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
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
				<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate('/calculations')}
								className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
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
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate('/calculations')}
							className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
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
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={`p-6 rounded-xl border-2 ${
						calculation.meetsNisaab
							? 'bg-success-50 dark:bg-success-900/20 border-success-300 dark:border-success-700'
							: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
					}`}
				>
					<div className="flex items-center gap-3 mb-4">
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
								Based on {calculation.nisaabBase === 'gold' ? 'Gold' : 'Silver'} Nisaab
							</p>
						</div>
					</div>

					{calculation.meetsNisaab && calculation.zakatDue !== null && (
						<div className="mt-4 pt-4 border-t border-success-200 dark:border-success-800">
							<div className="flex items-baseline gap-2">
								<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
									Zakaat Due ({calculation.zakatRate}%):
								</span>
								<span className="text-2xl font-bold text-success-600 dark:text-success-400">
									{formatCurrency(calculation.zakatDue, preferredCurrency)}
								</span>
							</div>
						</div>
					)}
				</motion.div>

				{/* Breakdown */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60 space-y-4"
				>
					<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
						Calculation Breakdown
					</h3>

					{/* Assets */}
					<div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
						<div className="flex items-center gap-3 mb-2">
							<BanknotesIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
							<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Total Assets
							</h4>
						</div>
						<p className="text-2xl font-bold text-success-600 dark:text-success-400">
							{formatCurrency(calculation.totalAssets, preferredCurrency)}
						</p>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
							{Array.isArray(calculation.assets) ? calculation.assets.length : 0} asset
							{Array.isArray(calculation.assets) && calculation.assets.length !== 1 ? 's' : ''}
						</p>
					</div>

					{/* Liabilities */}
					<div className="p-4 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
						<div className="flex items-center gap-3 mb-2">
							<ChartBarIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
							<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Total Liabilities
							</h4>
						</div>
						<p className="text-2xl font-bold text-error-600 dark:text-error-400">
							{formatCurrency(calculation.totalLiabilities, preferredCurrency)}
						</p>
						<p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
							{Array.isArray(calculation.liabilities) ? calculation.liabilities.length : 0} liability
							{Array.isArray(calculation.liabilities) && calculation.liabilities.length !== 1 ? 'ies' : ''}
						</p>
					</div>

					{/* Net Worth */}
					<div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
						<div className="flex items-center gap-3 mb-2">
							<CalculatorIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
							<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Net Worth
							</h4>
						</div>
						<p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
							{formatCurrency(calculation.netWorth, preferredCurrency)}
						</p>
					</div>
				</motion.div>

				{/* Nisaab Info */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
				>
					<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
						Nisaab Information
					</h3>
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">Base Used:</span>
							<span className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
								{calculation.nisaabBase}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">Threshold:</span>
							<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								{formatCurrency(calculation.nisaabThreshold, preferredCurrency)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">Gold Nisaab:</span>
							<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								{formatCurrency(calculation.goldNisaabValue, preferredCurrency)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600 dark:text-slate-400">Silver Nisaab:</span>
							<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								{formatCurrency(calculation.silverNisaabValue, preferredCurrency)}
							</span>
						</div>
					</div>
				</motion.div>

				{/* Notification Preferences */}
				{calculation.notificationEnabled && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
					>
						<h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
							Notification Preferences
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Frequency:</span>
								<span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
         {calculation.notificationFrequency || 'Not set'}
								</span>
							</div>
							{calculation.nextNotificationDate && (
								<div className="flex items-center justify-between">
									<span className="text-slate-600 dark:text-slate-400">Next Notification:</span>
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

