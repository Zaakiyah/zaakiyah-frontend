import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCurrencyStore } from '../../store/currencyStore';
import type { SupportedCurrency } from '../../services/currencyService';

interface CurrencySelectorProps {
	value?: string;
	onChange?: (currency: string) => void;
	label?: string;
	error?: string;
	disabled?: boolean;
	className?: string;
}

export default function CurrencySelector({
	value,
	onChange,
	label,
	error,
	disabled = false,
	className = '',
}: CurrencySelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
	const dropdownRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	
	const { preferredCurrency, supportedCurrencies, fetchSupportedCurrencies } = useCurrencyStore();
	const selectedCurrency = value || preferredCurrency;

	// Fetch currencies on mount
	useEffect(() => {
		if (supportedCurrencies.length === 0) {
			fetchSupportedCurrencies();
		}
	}, [supportedCurrencies.length, fetchSupportedCurrencies]);

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

	// Filter currencies based on search
	const filteredCurrencies = supportedCurrencies.filter((currency) =>
		currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		currency.code.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const selectedCurrencyMeta = supportedCurrencies.find((c) => c.code === selectedCurrency);

	const handleSelect = (currency: SupportedCurrency) => {
		onChange?.(currency.code);
		// Only update global preferred currency if this selector is being used for global settings
		// Don't update it when used for individual assets/liabilities
		// The onChange callback will handle the specific item's currency update
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
					focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400
					${error ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500/20 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
					${isOpen && !error ? 'ring-2 ring-primary-500/20 dark:ring-primary-400/20 border-primary-500 dark:border-primary-400 shadow-lg' : ''}
					${disabled ? 'bg-slate-50 dark:bg-slate-700 cursor-not-allowed opacity-60' : 'cursor-pointer'}
				`}
			>
				<div className="flex items-center gap-2 min-w-0 flex-1">
					{selectedCurrencyMeta ? (
						<>
							<span className="text-lg font-medium">{selectedCurrencyMeta.symbol}</span>
							<span className="text-sm text-slate-700 dark:text-slate-300 truncate">
								{selectedCurrencyMeta.name}
							</span>
							<span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">({selectedCurrencyMeta.code})</span>
						</>
					) : (
						<span className="text-sm text-slate-500 dark:text-slate-400">Select currency...</span>
					)}
				</div>
				<ChevronDownIcon
					className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{error && (
				<p className="mt-1.5 text-xs text-error-600 dark:text-error-400">{error}</p>
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
								className="fixed z-[9998] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-hidden flex flex-col"
								style={{
									top: `${dropdownPosition.top}px`,
									left: `${dropdownPosition.left}px`,
									width: `${dropdownPosition.width}px`,
								}}
							>
					{/* Search input */}
					<div className="p-3 border-b border-slate-200 dark:border-slate-700">
						<input
							type="text"
							placeholder="Search currency..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-3 py-2 text-sm font-medium border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
							autoFocus
						/>
					</div>

					{/* Currency list */}
					<div className="overflow-y-auto flex-1">
						{filteredCurrencies.length === 0 ? (
							<div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
								No currencies found
							</div>
						) : (
							filteredCurrencies.map((currency) => (
								<button
									key={currency.code}
									type="button"
									onClick={() => handleSelect(currency)}
									className={`
										w-full px-4 py-3 text-left flex items-center gap-3 font-medium
										transition-all duration-200
										${selectedCurrency === currency.code 
											? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20' 
											: 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800'
										}
									`}
								>
									<span className="text-lg font-medium w-8">{currency.symbol}</span>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium text-slate-900 dark:text-slate-100">
											{currency.name}
										</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">{currency.code}</div>
									</div>
									{selectedCurrency === currency.code && (
										<CheckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
									)}
								</button>
							))
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

