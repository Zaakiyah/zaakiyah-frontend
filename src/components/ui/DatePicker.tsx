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
}

export default function DatePicker({
	value,
	onChange,
	placeholder = 'Select date',
	maxDate,
	minDate,
	disabled = false,
	className = '',
}: DatePickerProps) {
	useTheme();
	const [isOpen, setIsOpen] = useState(false);
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
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
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

	const handleDateSelect = (day: number) => {
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];
		
		// Check constraints
		if (maxDate && dateString > maxDate) return;
		if (minDate && dateString < minDate) return;

		onChange(dateString);
		setIsOpen(false);
	};

	const isDateSelected = (day: number): boolean => {
		if (!value) return false;
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];
		return dateString === value;
	};

	const isDateDisabled = (day: number): boolean => {
		const date = new Date(currentMonth.year, currentMonth.month, day);
		const dateString = date.toISOString().split('T')[0];
		
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
						transition={{ duration: 0.2 }}
						className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4"
					>
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
											aspect-square rounded-lg text-sm font-medium transition-all
											${
												disabled
													? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600'
													: 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
											}
											${
												selected
													? 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-500'
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

