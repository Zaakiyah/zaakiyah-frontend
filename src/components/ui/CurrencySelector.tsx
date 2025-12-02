import { useState, useEffect, useRef } from 'react';
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
	const dropdownRef = useRef<HTMLDivElement>(null);
	
	const { preferredCurrency, supportedCurrencies, fetchSupportedCurrencies } = useCurrencyStore();
	const selectedCurrency = value || preferredCurrency;

	// Fetch currencies on mount
	useEffect(() => {
		if (supportedCurrencies.length === 0) {
			fetchSupportedCurrencies();
		}
	}, [supportedCurrencies.length, fetchSupportedCurrencies]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setSearchQuery('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Filter currencies based on search
	const filteredCurrencies = supportedCurrencies.filter((currency) =>
		currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		currency.code.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const selectedCurrencyMeta = supportedCurrencies.find((c) => c.code === selectedCurrency);

	const handleSelect = (currency: SupportedCurrency) => {
		onChange?.(currency.code);
		useCurrencyStore.getState().setPreferredCurrency(currency.code);
		setIsOpen(false);
		setSearchQuery('');
	};

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			{label && (
				<label className="block text-sm font-medium text-slate-700 mb-1.5">
					{label}
				</label>
			)}

			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`
					w-full px-4 py-2.5 text-left bg-white border rounded-lg
					flex items-center justify-between gap-2
					transition-colors
					${error ? 'border-error-300 focus:border-error-500' : 'border-slate-300 focus:border-primary-500'}
					${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'hover:border-slate-400 cursor-pointer'}
					focus:outline-none focus:ring-2 focus:ring-primary-500/20
				`}
			>
				<div className="flex items-center gap-2 min-w-0 flex-1">
					{selectedCurrencyMeta ? (
						<>
							<span className="text-lg font-medium">{selectedCurrencyMeta.symbol}</span>
							<span className="text-sm text-slate-700 truncate">
								{selectedCurrencyMeta.name}
							</span>
							<span className="text-xs text-slate-500 ml-auto">({selectedCurrencyMeta.code})</span>
						</>
					) : (
						<span className="text-sm text-slate-500">Select currency...</span>
					)}
				</div>
				<ChevronDownIcon
					className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{error && (
				<p className="mt-1.5 text-xs text-error-600">{error}</p>
			)}

			{isOpen && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
					{/* Search input */}
					<div className="p-2 border-b border-slate-200">
						<input
							type="text"
							placeholder="Search currency..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
							autoFocus
						/>
					</div>

					{/* Currency list */}
					<div className="overflow-y-auto flex-1">
						{filteredCurrencies.length === 0 ? (
							<div className="px-4 py-3 text-sm text-slate-500 text-center">
								No currencies found
							</div>
						) : (
							filteredCurrencies.map((currency) => (
								<button
									key={currency.code}
									type="button"
									onClick={() => handleSelect(currency)}
									className={`
										w-full px-4 py-2.5 text-left flex items-center gap-3
										hover:bg-slate-50 transition-colors
										${selectedCurrency === currency.code ? 'bg-primary-50' : ''}
									`}
								>
									<span className="text-lg font-medium w-8">{currency.symbol}</span>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium text-slate-900">
											{currency.name}
										</div>
										<div className="text-xs text-slate-500">{currency.code}</div>
									</div>
									{selectedCurrency === currency.code && (
										<CheckIcon className="w-5 h-5 text-primary-600 shrink-0" />
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

