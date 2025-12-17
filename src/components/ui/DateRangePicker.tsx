import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	CalendarIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';

interface DateRangePickerProps {
	startDate?: string;
	endDate?: string;
	onChange: (startDate: string | undefined, endDate: string | undefined) => void;
	placeholder?: string;
	maxDate?: string;
	minDate?: string;
	disabled?: boolean;
	className?: string;
}

export default function DateRangePicker({
	startDate,
	endDate,
	onChange,
	placeholder = 'Select date range',
	maxDate,
	minDate,
	disabled = false,
	className = '',
}: DateRangePickerProps) {
	useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [selectingStart, setSelectingStart] = useState(true); // true = selecting start, false = selecting end
	const [currentMonth, setCurrentMonth] = useState(() => {
		const dateToUse = startDate ? new Date(startDate) : new Date();
		return { year: dateToUse.getFullYear(), month: dateToUse.getMonth() };
	});
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const formatDisplayDate = (dateString: string | undefined): string => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatDisplayRange = (): string => {
		if (startDate && endDate) {
			return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
		}
		if (startDate) {
			return `${formatDisplayDate(startDate)} - ...`;
		}
		return placeholder;
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

	const handleDateSelect = (day: number) => {
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];

		// Check constraints
		if (maxDate && dateString > maxDate) return;
		if (minDate && dateString < minDate) return;

		if (selectingStart) {
			// If selecting start date and endDate exists and selected date is after endDate, reset endDate
			if (endDate && dateString > endDate) {
				onChange(dateString, undefined);
				setSelectingStart(false);
			} else {
				onChange(dateString, endDate);
				setSelectingStart(false);
			}
		} else {
			// Selecting end date
			if (!startDate) {
				// If no start date, set as start
				onChange(dateString, undefined);
				setSelectingStart(false);
			} else if (dateString < startDate) {
				// If selected date is before start, swap them
				onChange(dateString, startDate);
				setSelectingStart(false);
			} else {
				// Valid end date
				onChange(startDate, dateString);
				setIsOpen(false); // Close after selecting end date
			}
		}
	};

	const isDateInRange = (day: number): boolean => {
		if (!startDate || !endDate) return false;
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];
		return dateString >= startDate && dateString <= endDate;
	};

	const isDateStart = (day: number): boolean => {
		if (!startDate) return false;
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];
		return dateString === startDate;
	};

	const isDateEnd = (day: number): boolean => {
		if (!endDate) return false;
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];
		return dateString === endDate;
	};

	const isDateDisabled = (day: number): boolean => {
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];

		if (maxDate && dateString > maxDate) return true;
		if (minDate && dateString < minDate) return true;

		// If selecting end date and startDate exists, disable dates before startDate
		if (!selectingStart && startDate && dateString < startDate) return true;

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

	const clearRange = () => {
		onChange(undefined, undefined);
		setSelectingStart(true);
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
			{/* Input Button */}
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`
					w-full px-3 py-2 text-sm rounded-lg border-2 transition-all
					flex items-center gap-2
					${
						disabled
							? 'opacity-60 cursor-not-allowed'
							: 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-600'
					}
					${
						isOpen
							? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20 dark:ring-primary-400/20'
							: 'border-slate-200 dark:border-slate-700'
					}
					bg-white dark:bg-slate-800
					text-slate-900 dark:text-slate-100
				`}
			>
				<CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
				<span className="flex-1 text-left truncate">{formatDisplayRange()}</span>
				{(startDate || endDate) && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							clearRange();
						}}
						className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
					>
						<XMarkIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
					</button>
				)}
			</button>

			{/* Calendar Dropdown */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4"
					>
						{/* Selection Status */}
						<div className="mb-3 flex items-center justify-between">
							<div className="text-xs font-medium text-slate-600 dark:text-slate-400">
								{selectingStart ? 'Select start date' : 'Select end date'}
							</div>
							{(startDate || endDate) && (
								<button
									type="button"
									onClick={clearRange}
									className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-medium"
								>
									Clear
								</button>
							)}
						</div>

						{/* Header */}
						<div className="flex items-center justify-between mb-4">
							<button
								type="button"
								onClick={() => navigateMonth('prev')}
								className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							>
								<ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
							</button>
							<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
								{monthName}
							</h3>
							<button
								type="button"
								onClick={() => navigateMonth('next')}
								className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							>
								<ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
							</button>
						</div>

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
								const inRange = isDateInRange(day);
								const isStart = isDateStart(day);
								const isEnd = isDateEnd(day);
								const disabled = isDateDisabled(day);
								const today = isToday(day);

								return (
									<button
										key={day}
										type="button"
										onClick={() => !disabled && handleDateSelect(day)}
										disabled={disabled}
										className={`
											aspect-square rounded-lg text-sm font-medium transition-all relative
											${
												disabled
													? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600'
													: 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
											}
											${
												isStart || isEnd
													? 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-500 font-semibold'
													: inRange
													? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
													: today
													? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
													: 'text-slate-700 dark:text-slate-300'
											}
										`}
									>
										{day}
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
