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

	const renderNisaabCard = (item: NisaabData, index?: number) => (
		<motion.div
			key={item.id}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index !== undefined ? index * 0.02 : 0 }}
			className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all"
		>
			{/* Compact Header */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm overflow-hidden shrink-0 relative">
						<CalendarIcon className="absolute w-10 h-10 text-white/15 -bottom-1 -right-1" />
						<span className="relative text-xs font-bold text-white z-10">
							{new Date(item.gregorianDate).getDate()}
						</span>
					</div>
					<div>
						<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
							{formatDate(item.gregorianDate)}
						</p>
						{item.hijriDate && (
							<p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
								{formatHijriDate(item.hijriDate)}
							</p>
						)}
					</div>
				</div>
				<button
					onClick={() => shareNisaab(item)}
					className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
					title="Share this nisaab"
				>
					<ShareIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
				</button>
			</div>

			{/* Compact Values */}
			<div className="grid grid-cols-2 gap-2">
				{/* Gold */}
				<div className="flex items-center gap-2 p-2 bg-gradient-to-br from-secondary-50 dark:from-secondary-900/20 to-secondary-50/60 dark:to-secondary-900/10 rounded-lg border border-secondary-200/50 dark:border-secondary-800/30">
					<div className="w-6 h-6 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded flex items-center justify-center flex-shrink-0">
						<SparklesIcon className="w-3 h-3 text-white" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
							Gold
						</p>
						<p
							className={`text-xs font-bold truncate ${
								formatCurrencyWithFallback(item.goldNisaabValue) === 'Not Available'
									? 'text-slate-400 dark:text-slate-500'
									: 'text-slate-900 dark:text-slate-100'
							}`}
						>
							{formatCurrencyWithFallback(item.goldNisaabValue)}
						</p>
					</div>
				</div>

				{/* Silver */}
				<div className="flex items-center gap-2 p-2 bg-gradient-to-br from-slate-50 dark:from-slate-700/50 to-slate-100/80 dark:to-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
					<div className="w-6 h-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded flex items-center justify-center flex-shrink-0">
						<CurrencyDollarIcon className="w-3 h-3 text-white" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
							Silver
						</p>
						<p
							className={`text-xs font-bold truncate ${
								formatCurrencyWithFallback(item.silverNisaabValue) ===
								'Not Available'
									? 'text-slate-400 dark:text-slate-500'
									: 'text-slate-900 dark:text-slate-100'
							}`}
						>
							{formatCurrencyWithFallback(item.silverNisaabValue)}
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	);

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

			<main className="px-4 py-3">
				{/* Date Range Filter */}
				<div className="mb-3 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
					<label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
						Date Range
					</label>
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
						className="mb-3 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60 space-y-3"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								Filter by
							</h3>
							{hasActiveFilters && (
								<button
									onClick={clearFilters}
									className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-medium"
								>
									Clear
								</button>
							)}
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
									Month
								</label>
								<select
									value={filters.month}
									onChange={(e) => handleFilterChange('month', e.target.value)}
									className="w-full px-3 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
								<label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
									Year
								</label>
								<select
									value={filters.year}
									onChange={(e) => handleFilterChange('year', e.target.value)}
									className="w-full px-3 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
					<div className="mb-3 flex flex-wrap gap-2">
						{startDate && (
							<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
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
							<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
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
							<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
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
							<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
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
					<div className="grid grid-cols-1 gap-2">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
							>
								<div className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
							</div>
						))}
					</div>
				) : filteredHistory.length === 0 && !searchResult ? (
					<div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-700/60 text-center">
						<CalendarIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
						<p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
							No history found
						</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{hasActiveFilters
								? 'Try adjusting your filters to see more results.'
								: 'Nisaab history will appear here once records are available.'}
						</p>
					</div>
				) : (
					!searchResult && (
						<>
							<div className="grid grid-cols-1 gap-2">
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
