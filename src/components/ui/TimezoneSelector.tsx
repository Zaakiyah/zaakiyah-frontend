import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

export interface TimezoneOption {
	value: string;
	label: string;
	group: string;
}

// Common timezones grouped by region
export const TIMEZONES: TimezoneOption[] = [
	// UTC
	{ value: 'UTC', label: 'UTC (Coordinated Universal Time)', group: 'UTC' },
	
	// North America
	{ value: 'America/New_York', label: 'Eastern Time (US & Canada)', group: 'North America' },
	{ value: 'America/Chicago', label: 'Central Time (US & Canada)', group: 'North America' },
	{ value: 'America/Denver', label: 'Mountain Time (US & Canada)', group: 'North America' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', group: 'North America' },
	{ value: 'America/Phoenix', label: 'Arizona', group: 'North America' },
	{ value: 'America/Anchorage', label: 'Alaska', group: 'North America' },
	{ value: 'America/Toronto', label: 'Toronto', group: 'North America' },
	{ value: 'America/Mexico_City', label: 'Mexico City', group: 'North America' },
	
	// Europe
	{ value: 'Europe/London', label: 'London', group: 'Europe' },
	{ value: 'Europe/Paris', label: 'Paris', group: 'Europe' },
	{ value: 'Europe/Berlin', label: 'Berlin', group: 'Europe' },
	{ value: 'Europe/Rome', label: 'Rome', group: 'Europe' },
	{ value: 'Europe/Madrid', label: 'Madrid', group: 'Europe' },
	{ value: 'Europe/Amsterdam', label: 'Amsterdam', group: 'Europe' },
	{ value: 'Europe/Stockholm', label: 'Stockholm', group: 'Europe' },
	{ value: 'Europe/Moscow', label: 'Moscow', group: 'Europe' },
	{ value: 'Europe/Istanbul', label: 'Istanbul', group: 'Europe' },
	
	// Middle East & Africa
	{ value: 'Asia/Dubai', label: 'Dubai', group: 'Middle East & Africa' },
	{ value: 'Asia/Riyadh', label: 'Riyadh', group: 'Middle East & Africa' },
	{ value: 'Asia/Kuwait', label: 'Kuwait', group: 'Middle East & Africa' },
	{ value: 'Africa/Cairo', label: 'Cairo', group: 'Middle East & Africa' },
	{ value: 'Africa/Johannesburg', label: 'Johannesburg', group: 'Middle East & Africa' },
	{ value: 'Africa/Lagos', label: 'Lagos', group: 'Middle East & Africa' },
	{ value: 'Africa/Nairobi', label: 'Nairobi', group: 'Middle East & Africa' },
	
	// Asia
	{ value: 'Asia/Karachi', label: 'Karachi', group: 'Asia' },
	{ value: 'Asia/Dhaka', label: 'Dhaka', group: 'Asia' },
	{ value: 'Asia/Kolkata', label: 'Kolkata', group: 'Asia' },
	{ value: 'Asia/Colombo', label: 'Colombo', group: 'Asia' },
	{ value: 'Asia/Bangkok', label: 'Bangkok', group: 'Asia' },
	{ value: 'Asia/Singapore', label: 'Singapore', group: 'Asia' },
	{ value: 'Asia/Hong_Kong', label: 'Hong Kong', group: 'Asia' },
	{ value: 'Asia/Shanghai', label: 'Shanghai', group: 'Asia' },
	{ value: 'Asia/Tokyo', label: 'Tokyo', group: 'Asia' },
	{ value: 'Asia/Seoul', label: 'Seoul', group: 'Asia' },
	{ value: 'Asia/Jakarta', label: 'Jakarta', group: 'Asia' },
	{ value: 'Asia/Manila', label: 'Manila', group: 'Asia' },
	
	// Australia & Pacific
	{ value: 'Australia/Sydney', label: 'Sydney', group: 'Australia & Pacific' },
	{ value: 'Australia/Melbourne', label: 'Melbourne', group: 'Australia & Pacific' },
	{ value: 'Australia/Brisbane', label: 'Brisbane', group: 'Australia & Pacific' },
	{ value: 'Australia/Perth', label: 'Perth', group: 'Australia & Pacific' },
	{ value: 'Pacific/Auckland', label: 'Auckland', group: 'Australia & Pacific' },
];

interface TimezoneSelectorProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	helperText?: string;
	disabled?: boolean;
	className?: string;
}

export default function TimezoneSelector({
	value,
	onChange,
	label = 'Timezone',
	helperText,
	disabled = false,
	className = '',
}: TimezoneSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
	const dropdownRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const selectedTimezone = TIMEZONES.find((tz) => tz.value === value) || TIMEZONES[0];

	// Group timezones by region
	const groupedTimezones = useMemo(() => {
		return TIMEZONES.reduce((acc, tz) => {
			if (!acc[tz.group]) {
				acc[tz.group] = [];
			}
			acc[tz.group].push(tz);
			return acc;
		}, {} as Record<string, TimezoneOption[]>);
	}, []);

	// Filter timezones based on search
	const filteredGroupedTimezones = useMemo(() => {
		if (!searchQuery.trim()) {
			return groupedTimezones;
		}
		const query = searchQuery.toLowerCase().trim();
		const filtered: Record<string, TimezoneOption[]> = {};
		
		Object.entries(groupedTimezones).forEach(([group, timezones]) => {
			const matching = timezones.filter(
				(tz) =>
					tz.label.toLowerCase().includes(query) ||
					tz.value.toLowerCase().includes(query) ||
					group.toLowerCase().includes(query)
			);
			if (matching.length > 0) {
				filtered[group] = matching;
			}
		});
		
		return filtered;
	}, [searchQuery, groupedTimezones]);

	// Calculate dropdown position when opening
	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom + window.scrollY + 8,
				left: rect.left + window.scrollX,
				width: rect.width,
			});
		}
	}, [isOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchQuery('');
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		} else {
			setSearchQuery('');
		}
	}, [isOpen]);

	const handleSelect = (timezoneValue: string) => {
		onChange(timezoneValue);
		setIsOpen(false);
		setSearchQuery('');
	};

	return (
		<div className={`relative z-10 ${className}`} ref={dropdownRef}>
			{label && (
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					{label}
				</label>
			)}

			<button
				ref={buttonRef}
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`
					w-full px-4 py-3 text-left bg-white dark:bg-slate-800 border-2 rounded-xl
					flex items-center justify-between gap-2 font-medium
					transition-all shadow-sm hover:shadow-md focus:shadow-lg
					border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600
					focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400
					${isOpen ? 'ring-2 ring-primary-500/20 dark:ring-primary-400/20 border-primary-500 dark:border-primary-400 shadow-lg' : ''}
					${disabled ? 'bg-slate-50 dark:bg-slate-700 cursor-not-allowed opacity-60' : 'cursor-pointer'}
				`}
			>
				<span className="block truncate text-slate-900 dark:text-slate-100 text-sm">
					{selectedTimezone.label}
				</span>
				<ChevronDownIcon
					className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform flex-shrink-0 ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{helperText && (
				<p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
			)}

			{typeof window !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<motion.div
								ref={dropdownRef}
								initial={{ opacity: 0, y: -10, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -10, scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 300, damping: 25 }}
								className="fixed z-[9998] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 max-h-80 overflow-hidden"
								style={{
									top: `${dropdownPosition.top}px`,
									left: `${dropdownPosition.left}px`,
									width: `${dropdownPosition.width}px`,
								}}
							>
						{/* Search Input */}
						<div className="p-3 border-b border-slate-200 dark:border-slate-700">
							<input
								ref={searchInputRef}
								type="text"
								placeholder="Search timezone..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 text-slate-900 dark:text-slate-100 shadow-sm"
							/>
						</div>

						{/* Timezone List */}
						<div className="overflow-y-auto max-h-64">
							{Object.entries(filteredGroupedTimezones).map(([group, timezones]) => (
								<div key={group}>
									<div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 sticky top-0">
										{group}
									</div>
									{timezones.map((timezone) => {
										const isSelected = timezone.value === value;
										return (
											<button
												key={timezone.value}
												type="button"
												onClick={() => handleSelect(timezone.value)}
												className={`
													w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200
													${isSelected
														? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-900 dark:text-primary-100'
														: 'text-slate-900 dark:text-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800'
													}
												`}
											>
												<div className="flex items-center gap-2">
													{isSelected && (
														<span className="text-primary-600 dark:text-primary-400">✓</span>
													)}
													<span>{timezone.label}</span>
												</div>
											</button>
										);
									})}
								</div>
							))}
						</div>

						{Object.keys(filteredGroupedTimezones).length === 0 && (
							<div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
								No timezones found
							</div>
						)}
							</motion.div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</div>
	);
}
