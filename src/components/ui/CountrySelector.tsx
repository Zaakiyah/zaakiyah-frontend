import Select from './Select';

interface Country {
	code: string;
	name: string;
	flag: string;
}

const COUNTRIES: Country[] = [
	{ code: 'US', name: 'United States', flag: '🇺🇸' },
	{ code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
	{ code: 'CA', name: 'Canada', flag: '🇨🇦' },
	{ code: 'AU', name: 'Australia', flag: '🇦🇺' },
	{ code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
	{ code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
	{ code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
	{ code: 'EG', name: 'Egypt', flag: '🇪🇬' },
	{ code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
	{ code: 'IN', name: 'India', flag: '🇮🇳' },
	{ code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
	{ code: 'KE', name: 'Kenya', flag: '🇰🇪' },
	{ code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
	{ code: 'GH', name: 'Ghana', flag: '🇬🇭' },
	{ code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
	{ code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
	{ code: 'UG', name: 'Uganda', flag: '🇺🇬' },
	{ code: 'SD', name: 'Sudan', flag: '🇸🇩' },
	{ code: 'MA', name: 'Morocco', flag: '🇲🇦' },
	{ code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
	{ code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
	{ code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
	{ code: 'YE', name: 'Yemen', flag: '🇾🇪' },
	{ code: 'SY', name: 'Syria', flag: '🇸🇾' },
	{ code: 'JO', name: 'Jordan', flag: '🇯🇴' },
	{ code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
	{ code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
	{ code: 'OM', name: 'Oman', flag: '🇴🇲' },
	{ code: 'QA', name: 'Qatar', flag: '🇶🇦' },
	{ code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
	{ code: 'TR', name: 'Turkey', flag: '🇹🇷' },
	{ code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
	{ code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
	{ code: 'SG', name: 'Singapore', flag: '🇸🇬' },
	{ code: 'PH', name: 'Philippines', flag: '🇵🇭' },
	{ code: 'TH', name: 'Thailand', flag: '🇹🇭' },
	{ code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
	{ code: 'CN', name: 'China', flag: '🇨🇳' },
	{ code: 'JP', name: 'Japan', flag: '🇯🇵' },
	{ code: 'KR', name: 'South Korea', flag: '🇰🇷' },
	{ code: 'FR', name: 'France', flag: '🇫🇷' },
	{ code: 'DE', name: 'Germany', flag: '🇩🇪' },
	{ code: 'IT', name: 'Italy', flag: '🇮🇹' },
	{ code: 'ES', name: 'Spain', flag: '🇪🇸' },
	{ code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
	{ code: 'BE', name: 'Belgium', flag: '🇧🇪' },
	{ code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
	{ code: 'AT', name: 'Austria', flag: '🇦🇹' },
	{ code: 'SE', name: 'Sweden', flag: '🇸🇪' },
	{ code: 'NO', name: 'Norway', flag: '🇳🇴' },
	{ code: 'DK', name: 'Denmark', flag: '🇩🇰' },
	{ code: 'FI', name: 'Finland', flag: '🇫🇮' },
	{ code: 'PL', name: 'Poland', flag: '🇵🇱' },
	{ code: 'BR', name: 'Brazil', flag: '🇧🇷' },
	{ code: 'MX', name: 'Mexico', flag: '🇲🇽' },
	{ code: 'AR', name: 'Argentina', flag: '🇦🇷' },
	{ code: 'CL', name: 'Chile', flag: '🇨🇱' },
	{ code: 'CO', name: 'Colombia', flag: '🇨🇴' },
	{ code: 'PE', name: 'Peru', flag: '🇵🇪' },
	{ code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
];

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectorProps {
	value: string;
	onChange: (value: string) => void;
	label?: React.ReactNode;
	error?: string;
	disabled?: boolean;
	className?: string;
}

export default function CountrySelector({
	value,
	onChange,
	label,
	error,
	disabled = false,
	className = '',
}: CountrySelectorProps) {
	const options = SORTED_COUNTRIES.map((country) => ({
		value: country.code,
		label: `${country.flag} ${country.name}`,
	}));

	return (
		<Select
			value={value}
			onChange={onChange}
			options={options}
			placeholder="Select country"
			label={label}
			error={error}
			disabled={disabled}
			className={className}
			searchable={true}
		/>
	);
}

