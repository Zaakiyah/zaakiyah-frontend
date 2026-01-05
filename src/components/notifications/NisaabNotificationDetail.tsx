import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { nisaabService } from '../../services/nisaabService';
import type { NisaabData } from '../../services/nisaabService';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatHijriDate } from '../../utils/date';
import { useCurrencyStore } from '../../store/currencyStore';
import { formatDistanceToNow } from 'date-fns';

interface NisaabNotificationDetailProps {
	isOpen: boolean;
	onClose: () => void;
	notification: {
		id: string;
		title: string;
		message: string | null;
		metadata: Record<string, any> | null;
		createdAt: string;
	};
}

export default function NisaabNotificationDetail({
	isOpen,
	onClose,
	notification,
}: NisaabNotificationDetailProps) {
	const { preferredCurrency } = useCurrencyStore();
	const [nisaabData, setNisaabData] = useState<NisaabData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && notification) {
			fetchNisaabData();
		} else {
			setNisaabData(null);
			setError(null);
		}
	}, [isOpen, notification]);

	const fetchNisaabData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Get the date from notification createdAt
			const notificationDate = new Date(notification.createdAt);
			const dateString = notificationDate.toISOString().split('T')[0];

			// Try to fetch Nisaab data for that date
			const response = await nisaabService.getNisaabByDate(dateString, preferredCurrency);

			if (response.data) {
				setNisaabData(response.data);
			} else {
				// Fallback to metadata values if API fails
				const metadata = notification.metadata || {};
				if (metadata.goldNisaab && metadata.silverNisaab) {
					setNisaabData({
						id: '',
						gregorianDate: dateString,
						hijriDate: '',
						goldPricePerGram: null,
						silverPricePerGram: null,
						goldNisaabValue: metadata.goldNisaab,
						silverNisaabValue: metadata.silverNisaab,
						createdAt: notification.createdAt,
						updatedAt: notification.createdAt,
					});
				} else {
					setError('Nisaab data not available for this date');
				}
			}
		} catch (err: any) {
			console.error('Error fetching Nisaab data:', err);
			// Fallback to metadata values
			const metadata = notification.metadata || {};
			if (metadata.goldNisaab && metadata.silverNisaab) {
				const notificationDate = new Date(notification.createdAt);
				const dateString = notificationDate.toISOString().split('T')[0];
				setNisaabData({
					id: '',
					gregorianDate: dateString,
					hijriDate: '',
					goldPricePerGram: null,
					silverPricePerGram: null,
					goldNisaabValue: metadata.goldNisaab,
					silverNisaabValue: metadata.silverNisaab,
					createdAt: notification.createdAt,
					updatedAt: notification.createdAt,
				});
			} else {
				setError(err.response?.data?.message || 'Failed to load Nisaab data');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const metadata = notification.metadata || {};
	const goldNisaab = nisaabData?.goldNisaabValue || metadata.goldNisaab;
	const silverNisaab = nisaabData?.silverNisaabValue || metadata.silverNisaab;

	if (!isOpen) return null;

	const modalContent = (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
					>
						<div
							className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
										<ChartBarIcon className="w-6 h-6 text-white" />
									</div>
									<div>
										<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
											Nisaab Update
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
											})}
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
								>
									<XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
								</button>
							</div>

							{/* Content */}
							<div className="flex-1 overflow-y-auto p-4">
								{isLoading ? (
									<div className="flex items-center justify-center py-12">
										<div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
									</div>
								) : error && !nisaabData ? (
									<div className="text-center py-12">
										<p className="text-red-600 dark:text-red-400 mb-4">
											{error}
										</p>
										<button
											onClick={fetchNisaabData}
											className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
										>
											Try Again
										</button>
									</div>
								) : (
									<div className="space-y-4">
										{/* Date Information */}
										{(nisaabData?.gregorianDate || nisaabData?.hijriDate) && (
											<div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
												<CalendarIcon className="w-4 h-4" />
												{nisaabData?.gregorianDate && (
													<span>
														{formatDate(nisaabData.gregorianDate)} G
													</span>
												)}
												{nisaabData?.gregorianDate &&
													nisaabData?.hijriDate && <span>•</span>}
												{nisaabData?.hijriDate && (
													<span>
														{formatHijriDate(nisaabData.hijriDate)} H
													</span>
												)}
											</div>
										)}

										{/* Gold Nisaab */}
										<div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-800">
											<div className="flex items-center justify-between mb-2">
												<h3 className="font-semibold text-slate-900 dark:text-slate-100">
													Gold Nisaab
												</h3>
												<span className="text-xs text-slate-500 dark:text-slate-400">
													87.48g
												</span>
											</div>
											<p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
												{goldNisaab
													? formatCurrency(
															Number(goldNisaab),
															preferredCurrency
													  )
													: 'Not Available'}
											</p>
											{nisaabData?.goldPricePerGram && (
												<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
													Price per gram:{' '}
													{formatCurrency(
														Number(nisaabData.goldPricePerGram),
														preferredCurrency
													)}
												</p>
											)}
										</div>

										{/* Silver Nisaab */}
										<div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-700/30 dark:to-gray-800/20 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600">
											<div className="flex items-center justify-between mb-2">
												<h3 className="font-semibold text-slate-900 dark:text-slate-100">
													Silver Nisaab
												</h3>
												<span className="text-xs text-slate-500 dark:text-slate-400">
													612.36g
												</span>
											</div>
											<p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
												{silverNisaab
													? formatCurrency(
															Number(silverNisaab),
															preferredCurrency
													  )
													: 'Not Available'}
											</p>
											{nisaabData?.silverPricePerGram && (
												<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
													Price per gram:{' '}
													{formatCurrency(
														Number(nisaabData.silverPricePerGram),
														preferredCurrency
													)}
												</p>
											)}
										</div>

										{/* Message */}
										{notification.message && (
											<div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
												<p className="text-sm text-primary-900 dark:text-primary-100">
													{notification.message}
												</p>
											</div>
										)}

										{/* Info */}
										<div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
											<p className="text-xs text-slate-600 dark:text-slate-400">
												Nisaab is the minimum threshold of wealth that makes
												Zakat obligatory. If your net worth meets or exceeds
												this threshold, you are required to pay Zakat.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);

	// Render to portal to ensure it's above all other elements including bottom nav
	if (typeof window !== 'undefined') {
		return createPortal(modalContent, document.body);
	}

	return null;
}
