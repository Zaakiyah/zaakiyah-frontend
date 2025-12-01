import { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import type { InputHTMLAttributes } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Country {
	code: string;
	dialCode: string;
	name: string;
	flag: string;
}

const COUNTRIES: Country[] = [
	{ code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
	{ code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
	{ code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
	{ code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
	{ code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬' },
	{ code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
	{ code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
	{ code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬' },
	{ code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
	{ code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
	{ code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' },
	{ code: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪' },
	{ code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
	{ code: 'GH', dialCode: '+233', name: 'Ghana', flag: '🇬🇭' },
	{ code: 'ET', dialCode: '+251', name: 'Ethiopia', flag: '🇪🇹' },
	{ code: 'TZ', dialCode: '+255', name: 'Tanzania', flag: '🇹🇿' },
	{ code: 'UG', dialCode: '+256', name: 'Uganda', flag: '🇺🇬' },
	{ code: 'SD', dialCode: '+249', name: 'Sudan', flag: '🇸🇩' },
	{ code: 'MA', dialCode: '+212', name: 'Morocco', flag: '🇲🇦' },
	{ code: 'DZ', dialCode: '+213', name: 'Algeria', flag: '🇩🇿' },
	{ code: 'IQ', dialCode: '+964', name: 'Iraq', flag: '🇮🇶' },
	{ code: 'AF', dialCode: '+93', name: 'Afghanistan', flag: '🇦🇫' },
	{ code: 'YE', dialCode: '+967', name: 'Yemen', flag: '🇾🇪' },
	{ code: 'SY', dialCode: '+963', name: 'Syria', flag: '🇸🇾' },
	{ code: 'JO', dialCode: '+962', name: 'Jordan', flag: '🇯🇴' },
	{ code: 'LB', dialCode: '+961', name: 'Lebanon', flag: '🇱🇧' },
	{ code: 'KW', dialCode: '+965', name: 'Kuwait', flag: '🇰🇼' },
	{ code: 'OM', dialCode: '+968', name: 'Oman', flag: '🇴🇲' },
	{ code: 'QA', dialCode: '+974', name: 'Qatar', flag: '🇶🇦' },
	{ code: 'BH', dialCode: '+973', name: 'Bahrain', flag: '🇧🇭' },
	{ code: 'TR', dialCode: '+90', name: 'Turkey', flag: '🇹🇷' },
	{ code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
	{ code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
	{ code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
	{ code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭' },
	{ code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭' },
	{ code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
	{ code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
	{ code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
	{ code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
	{ code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
	{ code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
	{ code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
	{ code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
	{ code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱' },
	{ code: 'BE', dialCode: '+32', name: 'Belgium', flag: '🇧🇪' },
	{ code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭' },
	{ code: 'AT', dialCode: '+43', name: 'Austria', flag: '🇦🇹' },
	{ code: 'SE', dialCode: '+46', name: 'Sweden', flag: '🇸🇪' },
	{ code: 'NO', dialCode: '+47', name: 'Norway', flag: '🇳🇴' },
	{ code: 'DK', dialCode: '+45', name: 'Denmark', flag: '🇩🇰' },
	{ code: 'FI', dialCode: '+358', name: 'Finland', flag: '🇫🇮' },
	{ code: 'PL', dialCode: '+48', name: 'Poland', flag: '🇵🇱' },
	{ code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
	{ code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
	{ code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷' },
	{ code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱' },
	{ code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴' },
	{ code: 'PE', dialCode: '+51', name: 'Peru', flag: '🇵🇪' },
	{ code: 'VE', dialCode: '+58', name: 'Venezuela', flag: '🇻🇪' },
];

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

interface PhoneInputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
	label?: string;
	error?: string;
	helperText?: string;
	value?: string;
	onChange?: (value: string) => void;
	defaultCountry?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	(
		{
			label,
			error,
			helperText,
			value = '',
			onChange,
			defaultCountry = 'NG',
			className = '',
			...props
		},
		ref
	) => {
		const [isOpen, setIsOpen] = useState(false);
		const [searchQuery, setSearchQuery] = useState('');
		const [selectedCountry, setSelectedCountry] = useState<Country>(
			SORTED_COUNTRIES.find((c) => c.code === defaultCountry) || SORTED_COUNTRIES[0]
		);
		const [phoneNumber, setPhoneNumber] = useState('');
		const dropdownRef = useRef<HTMLDivElement>(null);
		const searchInputRef = useRef<HTMLInputElement>(null);

		const filteredCountries = useMemo(() => {
			if (!searchQuery.trim()) {
				return SORTED_COUNTRIES;
			}
			const query = searchQuery.toLowerCase().trim();
			return SORTED_COUNTRIES.filter(
				(country) =>
					country.name.toLowerCase().includes(query) ||
					country.dialCode.includes(query) ||
					country.code.toLowerCase().includes(query)
			);
		}, [searchQuery]);

		useEffect(() => {
			if (value) {
				for (const country of SORTED_COUNTRIES) {
					if (value.startsWith(country.dialCode)) {
						setSelectedCountry(country);
						setPhoneNumber(value.slice(country.dialCode.length).trim());
						return;
					}
				}
				setPhoneNumber(value);
			}
		}, [value]);

		useEffect(() => {
			if (isOpen && searchInputRef.current) {
				setTimeout(() => {
					searchInputRef.current?.focus();
				}, 100);
			} else {
				setSearchQuery('');
			}
		}, [isOpen]);

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
					setIsOpen(false);
				}
			};

			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}, []);

		const handleCountrySelect = (country: Country) => {
			setSelectedCountry(country);
			setIsOpen(false);
			const fullNumber = country.dialCode + phoneNumber;
			onChange?.(fullNumber);
		};

		const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const number = e.target.value.replace(/\D/g, ''); // Only digits
			setPhoneNumber(number);
			const fullNumber = selectedCountry.dialCode + number;
			onChange?.(fullNumber);
		};

		return (
			<div className="w-full">
				{label && (
					<label className="block text-sm font-medium text-slate-900 mb-2">{label}</label>
				)}
				<div className="relative flex">
					<div className="relative" ref={dropdownRef}>
						<button
							type="button"
							onClick={() => setIsOpen(!isOpen)}
							className={`
								px-4 py-3 rounded-l-xl border-2 border-r-0
								transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
								bg-white flex items-center gap-2
								${
									error
										? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
										: 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
								}
							`}
						>
							<span className="text-xl">{selectedCountry.flag}</span>
							<span className="text-sm font-medium text-slate-700">
								{selectedCountry.dialCode}
							</span>
							<ChevronDownIcon
								className={`w-4 h-4 text-slate-500 transition-transform ${
									isOpen ? 'rotate-180' : ''
								}`}
							/>
						</button>

						<AnimatePresence>
							{isOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setIsOpen(false)}
									/>
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-hidden bg-white border-2 border-slate-200 rounded-xl shadow-lg z-20 flex flex-col"
									>
										<div className="p-2 border-b border-slate-200 sticky top-0 bg-white z-10">
											<div className="relative">
												<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
												<input
													ref={searchInputRef}
													type="text"
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
													placeholder="Search country..."
													className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
													onClick={(e) => e.stopPropagation()}
												/>
											</div>
										</div>
										<div className="overflow-y-auto max-h-64">
											{filteredCountries.length > 0 ? (
												<div className="p-2">
													{filteredCountries.map((country) => (
														<button
															key={country.code}
															type="button"
															onClick={() =>
																handleCountrySelect(country)
															}
															className={`
																w-full px-3 py-2 rounded-lg text-left
																transition-colors flex items-center gap-3
																${
																	selectedCountry.code ===
																	country.code
																		? 'bg-primary-50 text-primary-700'
																		: 'hover:bg-slate-50 text-slate-700'
																}
															`}
														>
															<span className="text-xl">
																{country.flag}
															</span>
															<span className="flex-1 text-sm font-medium">
																{country.name}
															</span>
															<span className="text-sm text-slate-500">
																{country.dialCode}
															</span>
														</button>
													))}
												</div>
											) : (
												<div className="p-4 text-center text-sm text-slate-500">
													No countries found
												</div>
											)}
										</div>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>

					{/* Phone Number Input */}
					<input
						ref={ref}
						type="tel"
						inputMode="numeric"
						value={phoneNumber}
						onChange={handleNumberChange}
						placeholder="1234567890"
						className={`
							flex-1 px-5 py-3 
							rounded-r-xl border-2 transition-all duration-200
							text-sm
							focus:outline-none focus:ring-2 focus:ring-offset-0
							placeholder:text-slate-400
							bg-white
							${
								error
									? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
									: 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
							}
							${className}
						`}
						{...props}
					/>
				</div>
				{error && (
					<p className="mt-2 text-sm text-error-600" role="alert">
						{error}
					</p>
				)}
				{helperText && !error && (
					<p className="mt-2 text-sm text-slate-500">{helperText}</p>
				)}
			</div>
		);
	}
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
