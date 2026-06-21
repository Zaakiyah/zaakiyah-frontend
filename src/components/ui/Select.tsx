import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value: string;
	onChange: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	label?: React.ReactNode;
	error?: string;
	disabled?: boolean;
	className?: string;
	searchable?: boolean;
}

export default function Select({
	value,
	onChange,
	options,
	placeholder = 'Select an option',
	label,
	error,
	disabled = false,
	className = '',
	searchable = false,
}: SelectProps) {
	useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

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

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
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

	const selectedOption = options.find((opt) => opt.value === value);

	// Filter options based on search query
	const filteredOptions = useMemo(() => {
		if (!searchable || !searchQuery.trim()) {
			return options;
		}
		const query = searchQuery.toLowerCase().trim();
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(query) ||
				option.value.toLowerCase().includes(query)
		);
	}, [options, searchQuery, searchable]);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && searchable && searchInputRef.current) {
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		} else if (!isOpen) {
			setSearchQuery('');
		}
	}, [isOpen, searchable]);

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
		setSearchQuery('');
	};

	return (
		<div ref={containerRef} className={`relative z-10 ${className}`}>
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
				className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-left flex items-center justify-between transition-all font-medium shadow-sm hover:shadow-md focus:shadow-lg ${
					error
						? 'border-red-500 dark:border-red-500'
						: 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
				} ${
					isOpen && !error
						? 'ring-2 ring-primary-500/20 dark:ring-primary-400/20 border-primary-500 dark:border-primary-400 shadow-lg'
						: 'focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400'
				} ${
					disabled
						? 'opacity-50 cursor-not-allowed'
						: 'cursor-pointer'
				} text-slate-900 dark:text-slate-100`}
			>
				<span
					className={`${
						selectedOption ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'
					}`}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDownIcon
					className={`w-5 h-5 text-slate-400 transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{error && (
				<p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
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
								className="fixed z-[9998] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col"
								style={{
									top: `${dropdownPosition.top}px`,
									left: `${dropdownPosition.left}px`,
									width: `${dropdownPosition.width}px`,
								}}
							>
						{searchable && (
							<div className="p-2 border-b border-slate-200 dark:border-slate-700">
								<div className="relative">
									<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
									<input
										ref={searchInputRef}
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search..."
										className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 shadow-sm"
										onClick={(e) => e.stopPropagation()}
									/>
								</div>
							</div>
						)}
						<div className="overflow-y-auto max-h-48">
							{filteredOptions.length > 0 ? (
								filteredOptions.map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => handleSelect(option.value)}
										className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-200 font-medium ${
											value === option.value
												? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-600 dark:text-primary-400'
												: 'text-slate-900 dark:text-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800'
										}`}
									>
										<span>{option.label}</span>
										{value === option.value && (
											<CheckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
										)}
									</button>
								))
							) : (
								<div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
									No options found
								</div>
							)}
						</div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body
				)}
		</div>
	);
}

