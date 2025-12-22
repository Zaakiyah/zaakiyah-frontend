import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	CalendarIcon,
	SparklesIcon,
	CurrencyDollarIcon,
	FunnelIcon,
	XMarkIcon,
	ShareIcon,
	ChartBarIcon,
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import DateRangePicker from '../components/ui/DateRangePicker';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useTheme } from '../hooks/useTheme';
import { alert } from '../store/alertStore';
import { nisaabService, type NisaabData } from '../services/nisaabService';
import { formatCurrency } from '../utils/currency';

interface Filters {
	month: string;
	year: string;
}

export default function NisaabHistoryPage() {
	const { user } = useAuthStore();
	const { preferredCurrency, syncWithUserProfile, fetchSupportedCurrencies } = useCurrencyStore();
	useTheme();
	const [history, setHistory] = useState<NisaabData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState<Filters>({
		month: '',
		year: new Date().getFullYear().toString(),
	});
	const [showFilters, setShowFilters] = useState(false);
	const [searchParams] = useSearchParams();
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [searchResult, setSearchResult] = useState<NisaabData | null>(null);
	const [searchError, setSearchError] = useState<string | null>(null);
	const observerTarget = useRef<HTMLDivElement>(null);
	const isFetchingRef = useRef(false);

	const fetchHistory = useCallback(
		async (page: number, reset = false) => {
			if (isFetchingRef.current) return;

			isFetchingRef.current = true;
			if (reset) {
				setIsLoading(true);
			} else {
				setIsLoadingMore(true);
			}

			try {
				const currency = preferredCurrency || user?.preferredCurrency || 'USD';
				const response = await nisaabService.getNisaabHistory(
					page,
					30,
					currency,
					startDate || undefined,
					endDate || undefined
				);
				if (response.data && 'items' in response.data && 'pagination' in response.data) {
					const newItems = response.data.items;
					const pagination = response.data.pagination;

					if (reset) {
						setHistory(newItems);
					} else {
						setHistory((prev) => [...prev, ...newItems]);
					}

					setHasMore(page < pagination.totalPages);
					setCurrentPage(page);
				}
			} catch (error) {
				console.error('Failed to fetch nisaab history:', error);
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
				isFetchingRef.current = false;
			}
		},
		[preferredCurrency, user?.preferredCurrency, startDate, endDate]
	);

	// Sync currency with user profile on mount
	useEffect(() => {
		syncWithUserProfile();
		fetchSupportedCurrencies();
	}, [syncWithUserProfile, fetchSupportedCurrencies]);

	// Refetch history when currency changes
	useEffect(() => {
		// Skip on initial mount (handled by other effects)
		if (history.length === 0 && !searchResult) return;

		// If we have a search result, refetch it with new currency
		if (searchResult && (startDate || endDate)) {
			const refetchSearchResult = async () => {
				try {
					const currency = preferredCurrency || user?.preferredCurrency || 'USD';
					// If both dates are the same, search for that specific date
					if (startDate && endDate && startDate === endDate) {
						const response = await nisaabService.getNisaabByDate(startDate, currency);
						if (response.data) {
							setSearchResult(response.data);
						}
					}
				} catch (error: any) {
					console.error('Failed to refetch search result with new currency:', error);
				}
			};
			refetchSearchResult();
		}
		// If we have history and no date range, refetch history
		else if (!startDate && !endDate && history.length > 0) {
			fetchHistory(1, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [preferredCurrency, user?.preferredCurrency]);

	useEffect(() => {
		// Check if there's a date parameter in the URL (for backward compatibility)
		const urlDate = searchParams.get('date');
		if (urlDate) {
			setStartDate(urlDate);
			setEndDate(urlDate);
			// Automatically search for the date from URL
			const searchForDate = async () => {
				setSearchError(null);
				setSearchResult(null);

				try {
					const currency = preferredCurrency || user?.preferredCurrency || 'USD';
					const response = await nisaabService.getNisaabByDate(urlDate, currency);
					if (response.data) {
						setSearchResult(response.data);
					}
				} catch (error: any) {
					setSearchError(
						error.response?.data?.message ||
							'Nisaab not found for this date. Please try another date.'
					);
					setSearchResult(null);
				}
			};
			searchForDate();
		} else {
			fetchHistory(1, true);
		}
	}, [fetchHistory, searchParams, preferredCurrency, user?.preferredCurrency]);

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasMore &&
					!isLoadingMore &&
					!isFetchingRef.current
				) {
					fetchHistory(currentPage + 1, false);
				}
			},
			{ threshold: 0.1 }
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasMore, isLoadingMore, currentPage, fetchHistory]);

	// Filter history based on selected month/year and date range
	const filteredHistory = history.filter((item) => {
		const date = new Date(item.gregorianDate);
		const itemMonth = (date.getMonth() + 1).toString();
		const itemYear = date.getFullYear().toString();
		const itemDateStr = date.toISOString().split('T')[0];

		// Date range filter
		if (startDate || endDate) {
			if (startDate && itemDateStr < startDate) return false;
			if (endDate && itemDateStr > endDate) return false;
		}

		// Month/Year filter (complements date range)
		if (filters.month && filters.year) {
			return itemMonth === filters.month && itemYear === filters.year;
		}
		if (filters.year) {
			return itemYear === filters.year;
		}
		if (filters.month) {
			return itemMonth === filters.month;
		}

		return true;
	});

	const handleFilterChange = (key: keyof Filters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setShowFilters(false);
		fetchHistory(1, true);
	};

	const clearFilters = () => {
		setFilters({ month: '', year: new Date().getFullYear().toString() });
		handleDateRangeChange(undefined, undefined);
		setShowFilters(false);
		fetchHistory(1, true);
	};

	const handleDateRangeChange = (
		newStartDate: string | undefined,
		newEndDate: string | undefined
	) => {
		setStartDate(newStartDate || '');
		setEndDate(newEndDate || '');
		setSearchError(null);
		setSearchResult(null);
		// Automatically fetch history when date range changes
		if (newStartDate || newEndDate) {
			fetchHistory(1, true);
		}
	};

	const shareNisaab = async (nisaab: NisaabData) => {
		const date = new Date(nisaab.gregorianDate);
		const formattedDate = date.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});

		const goldValue = formatCurrencyWithFallback(nisaab.goldNisaabValue);
		const silverValue = formatCurrencyWithFallback(nisaab.silverNisaabValue);

		const text = `📊 Today's Nisaab (${formattedDate})\n\n💰 Gold: ${goldValue}\n💰 Silver: ${silverValue}\n\nCheck out Zaakiyah for Zakaat calculations and more!`;
		const url = `${window.location.origin}/nisaab/history?date=${nisaab.gregorianDate}`;
		const shareData = {
			title: "Today's Nisaab - Zaakiyah",
			text: text,
			url: url,
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					console.error('Error sharing:', err);
					fallbackShare(shareData);
				}
			}
		} else {
			fallbackShare(shareData);
		}
	};

	const fallbackShare = (shareData: { title: string; text: string; url: string }) => {
		const text = `${shareData.text}\n\n${shareData.url}`;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text).then(() => {
				alert.success('Nisaab details copied to clipboard!');
			});
		} else {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			alert.success('Nisaab details copied to clipboard!');
		}
	};

	// Format currency with "Not Available" fallback
	const formatCurrencyWithFallback = (value: string | number | null | undefined): string => {
		if (!value || value === 0 || value === '0') return 'Not Available';
		const numValue = typeof value === 'string' ? parseFloat(value) : value;
		if (isNaN(numValue) || numValue === 0) return 'Not Available';
		return formatCurrency(numValue);
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
		}).format(date);
	};

	const formatHijriDate = (hijriDate: string): string => {
		if (!hijriDate) return '';
		const parts = hijriDate.split('-');
		if (parts.length !== 3) return hijriDate;

		const day = parseInt(parts[2]);
		const month = parseInt(parts[1]);
		const year = parseInt(parts[0]);

		const monthNames = [
			'Muḥarram',
			'Ṣafar',
			'Rabīʿ al-awwal',
			'Rabīʿ al-thānī',
			'Jumādá al-ūlá',
			'Jumādá al-ākhirah',
			'Rajab',
			'Shaʿbān',
			'Ramaḍān',
			'Shawwāl',
			'Dhū al-Qaʿdah',
			'Dhū al-Ḥijjah',
		];

		return `${day} ${monthNames[month - 1]} ${year}`;
	};

	// Generate year options (current year and past 5 years)
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
	const months = [
		{ value: '1', label: 'January' },
		{ value: '2', label: 'February' },
		{ value: '3', label: 'March' },
		{ value: '4', label: 'April' },
		{ value: '5', label: 'May' },
		{ value: '6', label: 'June' },
		{ value: '7', label: 'July' },
		{ value: '8', label: 'August' },
		{ value: '9', label: 'September' },
		{ value: '10', label: 'October' },
		{ value: '11', label: 'November' },
		{ value: '12', label: 'December' },
	];

	const hasActiveFilters =
		filters.month !== '' || filters.year !== new Date().getFullYear().toString();

	// Calculate statistics for hero section
	const calculateStats = () => {
		if (filteredHistory.length === 0) return null;

		const validGoldValues = filteredHistory
			.map((item) => {
				const val = typeof item.goldNisaabValue === 'string' 
					? parseFloat(item.goldNisaabValue) 
					: item.goldNisaabValue;
				return val && !isNaN(val) && val > 0 ? val : null;
			})
			.filter((v): v is number => v !== null);

		const validSilverValues = filteredHistory
			.map((item) => {
				const val = typeof item.silverNisaabValue === 'string' 
					? parseFloat(item.silverNisaabValue) 
					: item.silverNisaabValue;
				return val && !isNaN(val) && val > 0 ? val : null;
			})
			.filter((v): v is number => v !== null);

		if (validGoldValues.length === 0 && validSilverValues.length === 0) return null;

		// Get latest from original history (most recent)
		const latestItem = history.length > 0 ? history[0] : null;
		const latestGold = latestItem ? (typeof latestItem.goldNisaabValue === 'string' 
			? parseFloat(latestItem.goldNisaabValue) 
			: latestItem.goldNisaabValue) : null;
		const latestSilver = latestItem ? (typeof latestItem.silverNisaabValue === 'string' 
			? parseFloat(latestItem.silverNisaabValue) 
			: latestItem.silverNisaabValue) : null;

		const avgGold = validGoldValues.reduce((a, b) => a + b, 0) / validGoldValues.length;
		const avgSilver = validSilverValues.reduce((a, b) => a + b, 0) / validSilverValues.length;

		return {
			latestGold: latestGold && !isNaN(latestGold) && latestGold > 0 ? latestGold : null,
			latestSilver: latestSilver && !isNaN(latestSilver) && latestSilver > 0 ? latestSilver : null,
			avgGold,
			avgSilver,
			totalRecords: filteredHistory.length,
		};
	};

	const stats = calculateStats();

	const renderNisaabCard = (item: NisaabData, index?: number) => {
		const goldValue = typeof item.goldNisaabValue === 'string' 
			? parseFloat(item.goldNisaabValue) 
			: item.goldNisaabValue;
		const silverValue = typeof item.silverNisaabValue === 'string' 
			? parseFloat(item.silverNisaabValue) 
			: item.silverNisaabValue;
		
		const prevItem = index !== undefined && index > 0 ? filteredHistory[index - 1] : null;
		const prevGold = prevItem ? (typeof prevItem.goldNisaabValue === 'string' 
			? parseFloat(prevItem.goldNisaabValue) 
			: prevItem.goldNisaabValue) : null;
		const prevSilver = prevItem ? (typeof prevItem.silverNisaabValue === 'string' 
			? parseFloat(prevItem.silverNisaabValue) 
			: prevItem.silverNisaabValue) : null;

		const goldTrend = prevGold && goldValue ? (goldValue > prevGold ? 'up' : goldValue < prevGold ? 'down' : 'same') : null;
		const silverTrend = prevSilver && silverValue ? (silverValue > prevSilver ? 'up' : silverValue < prevSilver ? 'down' : 'same') : null;

		return (
			<motion.div
				key={item.id}
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ 
					delay: index !== undefined ? index * 0.03 : 0,
					type: "spring",
					stiffness: 100
				}}
				whileHover={{ scale: 1.02, y: -2 }}
				className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-4 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
			>
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -z-0" />
				
				{/* Header */}
				<div className="flex items-start justify-between mb-4 relative z-10">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 dark:shadow-primary-700/30 overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:opacity-0" />
								<CalendarIcon className="w-7 h-7 text-white relative z-10" />
							</div>
							<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border-2 border-primary-500">
								<span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
									{new Date(item.gregorianDate).getDate()}
								</span>
							</div>
						</div>
						<div>
							<p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
								{formatDate(item.gregorianDate)}
							</p>
							{item.hijriDate && (
								<p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
									{formatHijriDate(item.hijriDate)}
								</p>
							)}
						</div>
					</div>
					<button
						onClick={() => shareNisaab(item)}
						className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 active:scale-95"
						title="Share this nisaab"
					>
						<ShareIcon className="w-5 h-5" />
					</button>
				</div>

				{/* Values Grid */}
				<div className="grid grid-cols-2 gap-3 relative z-10">
					{/* Gold Card */}
					<div className="relative group/gold overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/50 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-amber-800/10 p-3 border border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300">
						<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-2xl" />
						<div className="flex items-start gap-3 relative z-10">
							<div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
								<SparklesIcon className="w-6 h-6 text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-1">
									<p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
										Gold
									</p>
									{goldTrend && goldTrend !== 'same' && (
										<div className={`flex items-center flex-shrink-0 ${goldTrend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
											{goldTrend === 'up' ? (
												<ArrowTrendingUpIcon className="w-3 h-3" />
											) : (
												<ArrowTrendingDownIcon className="w-3 h-3" />
											)}
										</div>
									)}
								</div>
								<p
									className={`text-xs sm:text-sm md:text-base font-bold truncate ${
										formatCurrencyWithFallback(item.goldNisaabValue) === 'Not Available'
											? 'text-slate-400 dark:text-slate-500'
											: 'text-slate-900 dark:text-slate-100'
									}`}
									title={formatCurrencyWithFallback(item.goldNisaabValue)}
								>
									{formatCurrencyWithFallback(item.goldNisaabValue)}
								</p>
							</div>
						</div>
					</div>

					{/* Silver Card */}
					<div className="relative group/silver overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100/50 dark:from-slate-700/30 dark:via-gray-800/20 dark:to-slate-700/20 p-3 border-2 border-slate-200/50 dark:border-slate-600/30 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300">
						<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-2xl" />
						<div className="flex items-start gap-3 relative z-10">
							<div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/30 flex-shrink-0">
								<CurrencyDollarIcon className="w-6 h-6 text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-1">
									<p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
										Silver
									</p>
									{silverTrend && silverTrend !== 'same' && (
										<div className={`flex items-center flex-shrink-0 ${silverTrend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
											{silverTrend === 'up' ? (
												<ArrowTrendingUpIcon className="w-3 h-3" />
											) : (
												<ArrowTrendingDownIcon className="w-3 h-3" />
											)}
										</div>
									)}
								</div>
								<p
									className={`text-xs sm:text-sm md:text-base font-bold truncate ${
										formatCurrencyWithFallback(item.silverNisaabValue) === 'Not Available'
											? 'text-slate-400 dark:text-slate-500'
											: 'text-slate-900 dark:text-slate-100'
									}`}
									title={formatCurrencyWithFallback(item.silverNisaabValue)}
								>
									{formatCurrencyWithFallback(item.silverNisaabValue)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		);
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			<PageHeader
				title="Nisaab History"
				showBack
				rightAction={
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`p-1.5 rounded-lg transition-all active:scale-95 ${
							hasActiveFilters
								? 'bg-primary-100 text-primary-600'
								: 'hover:bg-slate-100 text-slate-700'
						}`}
					>
						<FunnelIcon className="w-5 h-5" />
					</button>
				}
			/>

			<main className="px-4 py-4">
				{/* Hero Stats Section */}
				{stats && !searchResult && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-6 shadow-xl"
					>
						{/* Decorative elements */}
						<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
						<div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/20 rounded-full blur-2xl" />
						
						<div className="relative z-10">
							<div className="flex items-center gap-2 mb-4">
								<div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
									<ChartBarIcon className="w-6 h-6 text-white" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-white">Summary</h2>
									<p className="text-xs text-white/80">{stats.totalRecords} records</p>
								</div>
							</div>
							
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 min-w-0">
									<p className="text-xs text-white/80 mb-1">Avg Gold</p>
									<p className="text-sm sm:text-base md:text-lg font-bold text-white truncate" title={formatCurrency(stats.avgGold)}>
										{formatCurrency(stats.avgGold)}
									</p>
								</div>
								<div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 min-w-0">
									<p className="text-xs text-white/80 mb-1">Avg Silver</p>
									<p className="text-sm sm:text-base md:text-lg font-bold text-white truncate" title={formatCurrency(stats.avgSilver)}>
										{formatCurrency(stats.avgSilver)}
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{/* Date Range Filter */}
				<div className="mb-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60">
					<div className="flex items-center gap-2 mb-3">
						<CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
						<label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
							Date Range
						</label>
					</div>
					<DateRangePicker
						startDate={startDate || undefined}
						endDate={endDate || undefined}
						onChange={handleDateRangeChange}
						placeholder="Select date range"
						maxDate={new Date().toISOString().split('T')[0]}
						className="w-full"
					/>
					{searchError && (
						<p className="mt-2 text-xs text-error-600 dark:text-error-400">
							{searchError}
						</p>
					)}
				</div>

				{/* Search Result */}
				{searchResult && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-3"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Search Result
							</h3>
							<button
								onClick={() => {
									setSearchResult(null);
									setStartDate('');
									setEndDate('');
									setSearchError(null);
								}}
								className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
							>
								Clear
							</button>
						</div>
						{renderNisaabCard(searchResult)}
					</motion.div>
				)}

				{/* Filters Panel */}
				{showFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="mb-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 space-y-4"
					>
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<FunnelIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
								<h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
									Filter by
								</h3>
							</div>
							{hasActiveFilters && (
								<button
									onClick={clearFilters}
									className="px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
								>
									Clear All
								</button>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
									Month
								</label>
								<select
									value={filters.month}
									onChange={(e) => handleFilterChange('month', e.target.value)}
									className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all font-medium"
								>
									<option value="">All months</option>
									{months.map((month) => (
										<option key={month.value} value={month.value}>
											{month.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
									Year
								</label>
								<select
									value={filters.year}
									onChange={(e) => handleFilterChange('year', e.target.value)}
									className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all font-medium"
								>
									{years.map((year) => (
										<option key={year} value={year.toString()}>
											{year}
										</option>
									))}
								</select>
							</div>
						</div>
					</motion.div>
				)}

				{/* Active Filters Display */}
				{hasActiveFilters && !searchResult && (
					<div className="mb-4 flex flex-wrap gap-2">
						{startDate && (
							<span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold border-2 border-primary-200/60 dark:border-primary-800/60 shadow-sm">
								From:{' '}
								{new Date(startDate).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
								<button
									onClick={() => {
										setStartDate('');
										if (!endDate) fetchHistory(1, true);
									}}
									className="hover:text-primary-900 dark:hover:text-primary-100"
								>
									<XMarkIcon className="w-3 h-3" />
								</button>
							</span>
						)}
						{endDate && (
							<span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold border-2 border-primary-200/60 dark:border-primary-800/60 shadow-sm">
								To:{' '}
								{new Date(endDate).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
								<button
									onClick={() => {
										setEndDate('');
										if (!startDate) fetchHistory(1, true);
									}}
									className="hover:text-primary-900 dark:hover:text-primary-100"
								>
									<XMarkIcon className="w-3 h-3" />
								</button>
							</span>
						)}
						{filters.month && (
							<span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold border-2 border-primary-200/60 dark:border-primary-800/60 shadow-sm">
								{months.find((m) => m.value === filters.month)?.label}
								<button
									onClick={() => handleFilterChange('month', '')}
									className="hover:text-primary-900 dark:hover:text-primary-100"
								>
									<XMarkIcon className="w-3 h-3" />
								</button>
							</span>
						)}
						{filters.year && filters.year !== new Date().getFullYear().toString() && (
							<span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold border-2 border-primary-200/60 dark:border-primary-800/60 shadow-sm">
								{filters.year}
								<button
									onClick={() =>
										handleFilterChange(
											'year',
											new Date().getFullYear().toString()
										)
									}
									className="hover:text-primary-900 dark:hover:text-primary-100"
								>
									<XMarkIcon className="w-3 h-3" />
								</button>
							</span>
						)}
					</div>
				)}

				{/* History List */}
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 animate-pulse"
							>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl" />
									<div className="flex-1">
										<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-24 mb-2" />
										<div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-32" />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl" />
									<div className="h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl" />
								</div>
							</div>
						))}
					</div>
				) : filteredHistory.length === 0 && !searchResult ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-12 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 text-center"
					>
						<div className="relative inline-block mb-4">
							<div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl" />
							<CalendarIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 relative z-10 mx-auto" />
						</div>
						<p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
							No history found
						</p>
						<p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
							{hasActiveFilters
								? 'Try adjusting your filters to see more results.'
								: 'Nisaab history will appear here once records are available.'}
						</p>
					</motion.div>
				) : (
					!searchResult && (
						<>
							<div className="grid grid-cols-1 gap-4">
								{filteredHistory.map((item, index) =>
									renderNisaabCard(item, index)
								)}
							</div>

							{/* Infinite Scroll Trigger */}
							<div
								ref={observerTarget}
								className="h-10 flex items-center justify-center py-4"
							>
								{isLoadingMore && (
									<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
										<div className="w-4 h-4 border-2 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
										Loading more...
									</div>
								)}
								{!hasMore && history.length > 0 && (
									<p className="text-xs text-slate-500 dark:text-slate-400">
										No more records
									</p>
								)}
							</div>
						</>
					)
				)}
			</main>

			<BottomNavigation />
		</div>
	);
}
