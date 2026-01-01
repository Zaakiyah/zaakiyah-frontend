import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';

interface DatePickerProps {
	value: string;
	onChange: (date: string) => void;
	placeholder?: string;
	maxDate?: string;
	minDate?: string;
	disabled?: boolean;
	className?: string;
	label?: React.ReactNode;
}

type ViewMode = 'calendar' | 'year' | 'month';

export default function DatePicker({
	value,
	onChange,
	placeholder = 'Select date',
	maxDate,
	minDate,
	disabled = false,
	className = '',
	label,
}: DatePickerProps) {
	useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>('calendar');
	const [currentMonth, setCurrentMonth] = useState(() => {
		if (value) {
			const date = new Date(value);
			return { year: date.getFullYear(), month: date.getMonth() };
		}
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() };
	});
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setViewMode('calendar'); // Reset view mode when closing
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Reset view mode when opening
	useEffect(() => {
		if (isOpen) {
			setViewMode('calendar');
		}
	}, [isOpen]);

	const formatDisplayDate = (dateString: string): string => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getDaysInMonth = (year: number, month: number): number => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (year: number, month: number): number => {
		return new Date(year, month, 1).getDay();
	};

	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentMonth((prev) => {
			if (direction === 'prev') {
				if (prev.month === 0) {
					return { year: prev.year - 1, month: 11 };
				}
				return { year: prev.year, month: prev.month - 1 };
			} else {
				if (prev.month === 11) {
					return { year: prev.year + 1, month: 0 };
				}
				return { year: prev.year, month: prev.month + 1 };
			}
		});
	};

	const navigateYear = (direction: 'prev' | 'next') => {
		setCurrentMonth((prev) => ({
			year: direction === 'prev' ? prev.year - 1 : prev.year + 1,
			month: prev.month,
		}));
	};

	const navigateDecade = (direction: 'prev' | 'next') => {
		setCurrentMonth((prev) => ({
			year: direction === 'prev' ? prev.year - 10 : prev.year + 10,
			month: prev.month,
		}));
	};

	const goToToday = () => {
		const today = new Date();
		setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() });
		setViewMode('calendar');
	};

	const handleYearSelect = (year: number) => {
		setCurrentMonth((prev) => ({ ...prev, year }));
		setViewMode('month');
	};

	const handleMonthSelect = (month: number) => {
		setCurrentMonth((prev) => ({ ...prev, month }));
		setViewMode('calendar');
	};

	// Generate years for year picker (current year ± 50 years)
	const getYearRange = () => {
		const currentYear = currentMonth.year;
		const startYear = Math.max(currentYear - 50, 1900);
		const endYear = Math.min(currentYear + 50, 2100);
		return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
	};

	const months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const handleDateSelect = (day: number) => {
		const date = new Date(currentMonth.year, currentMonth.month, day);
		// Format as YYYY-MM-DD using local timezone to avoid timezone shift
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const dayStr = String(date.getDate()).padStart(2, '0');
		const dateString = `${year}-${month}-${dayStr}`;
		
		// Check constraints
		if (maxDate && dateString > maxDate) return;
		if (minDate && dateString < minDate) return;

		onChange(dateString);
		setIsOpen(false);
	};

	const isDateSelected = (day: number): boolean => {
		if (!value) return false;
		const date = new Date(currentMonth.year, currentMonth.month, day);
		// Format as YYYY-MM-DD using local timezone
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const dayStr = String(date.getDate()).padStart(2, '0');
		const dateString = `${year}-${month}-${dayStr}`;
		return dateString === value;
	};

	const isDateDisabled = (day: number): boolean => {
		const date = new Date(currentMonth.year, currentMonth.month, day);
		// Format as YYYY-MM-DD using local timezone
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const dayStr = String(date.getDate()).padStart(2, '0');
		const dateString = `${year}-${month}-${dayStr}`;
		
		if (maxDate && dateString > maxDate) return true;
		if (minDate && dateString < minDate) return true;
		
		return false;
	};

	const isToday = (day: number): boolean => {
		const today = new Date();
		return (
			currentMonth.year === today.getFullYear() &&
			currentMonth.month === today.getMonth() &&
			day === today.getDate()
		);
	};

	const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
	const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	});

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			{label && (
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					{label}
				</label>
			)}
			{/* Input Button */}
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`
					w-full px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all
					flex items-center gap-2
					focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400
					shadow-sm hover:shadow-md focus:shadow-lg
					${
						disabled
							? 'opacity-60 cursor-not-allowed'
							: 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600'
					}
					${
						isOpen
							? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20 shadow-lg'
							: 'border-slate-200 dark:border-slate-700'
					}
					bg-white dark:bg-slate-800
					text-slate-900 dark:text-slate-100
				`}
			>
				<CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
				<span className="flex-1 text-left">
					{value ? formatDisplayDate(value) : placeholder}
				</span>
			</button>

			{/* Calendar Dropdown */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
						className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-4"
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-4">
							<button
								type="button"
								onClick={() => {
									if (viewMode === 'year') {
										navigateDecade('prev');
									} else if (viewMode === 'month') {
										navigateYear('prev');
									} else {
										navigateMonth('prev');
									}
								}}
								className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all"
							>
								<ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
							</button>
							<button
								type="button"
								onClick={() => {
									if (viewMode === 'calendar') {
										setViewMode('month');
									} else if (viewMode === 'month') {
										setViewMode('year');
									}
								}}
								className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
							>
								<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
									{viewMode === 'year'
										? `${Math.floor(currentMonth.year / 10) * 10}-${Math.floor(currentMonth.year / 10) * 10 + 9}`
										: viewMode === 'month'
											? currentMonth.year.toString()
											: monthName}
								</h3>
							</button>
							<button
								type="button"
								onClick={() => {
									if (viewMode === 'year') {
										navigateDecade('next');
									} else if (viewMode === 'month') {
										navigateYear('next');
									} else {
										navigateMonth('next');
									}
								}}
								className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all"
							>
								<ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
							</button>
						</div>

						{/* View Mode Content */}
						{viewMode === 'year' && (
							<div className="mb-2">
								<div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
									{getYearRange().map((year) => {
										const isCurrentYear = year === currentMonth.year;
										return (
											<button
												key={year}
												type="button"
												onClick={() => handleYearSelect(year)}
												className={`
													px-3 py-2 rounded-lg text-sm font-medium transition-all
													${
														isCurrentYear
															? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white shadow-md'
															: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
													}
												`}
											>
												{year}
											</button>
										);
									})}
								</div>
								<button
									type="button"
									onClick={goToToday}
									className="mt-3 w-full px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
								>
									Go to Today
								</button>
							</div>
						)}

						{viewMode === 'month' && (
							<div className="mb-2">
								<div className="grid grid-cols-3 gap-2">
									{months.map((month, index) => {
										const isCurrentMonth = index === currentMonth.month;
										return (
											<button
												key={month}
												type="button"
												onClick={() => handleMonthSelect(index)}
												className={`
													px-3 py-2 rounded-lg text-sm font-medium transition-all
													${
														isCurrentMonth
															? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white shadow-md'
															: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
													}
												`}
											>
												{month.slice(0, 3)}
											</button>
										);
									})}
								</div>
								<button
									type="button"
									onClick={goToToday}
									className="mt-3 w-full px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
								>
									Go to Today
								</button>
							</div>
						)}

						{viewMode === 'calendar' && (
							<>
								{/* Day Labels */}
								<div className="grid grid-cols-7 gap-1 mb-2">
									{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
										<div
											key={day}
											className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center py-1"
										>
											{day}
										</div>
									))}
								</div>

								{/* Calendar Grid */}
								<div className="grid grid-cols-7 gap-1">
									{/* Empty cells for days before month starts */}
									{Array.from({ length: firstDay }).map((_, i) => (
										<div key={`empty-${i}`} className="aspect-square" />
									))}

									{/* Days */}
									{days.map((day) => {
										const selected = isDateSelected(day);
										const disabled = isDateDisabled(day);
										const today = isToday(day);

										return (
											<button
												key={day}
												type="button"
												onClick={() => !disabled && handleDateSelect(day)}
												disabled={disabled}
												className={`
													aspect-square rounded-xl text-sm font-medium transition-all
													${
														disabled
															? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600'
															: 'cursor-pointer hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800'
													}
													${
														selected
															? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white shadow-md shadow-primary-500/30 dark:shadow-primary-600/30 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800'
															: today
																? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-600 dark:text-primary-400 font-bold border-2 border-primary-200 dark:border-primary-800'
																: 'text-slate-700 dark:text-slate-300'
													}
												`}
											>
												{day}
											</button>
										);
									})}
								</div>
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

