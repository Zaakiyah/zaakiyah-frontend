import { useCurrencyConversion } from '../../hooks/useCurrencyConversion';
import { formatCurrency } from '../../utils/currency';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface CurrencyDisplayProps {
	amount: number;
	originalCurrency: string;
	preferredCurrency: string;
	className?: string;
	showLabel?: boolean;
	label?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'success' | 'error' | 'primary';
}

/**
 * Component to display amount in original currency with converted value in preferred currency
 */
export default function CurrencyDisplay({
	amount,
	originalCurrency,
	preferredCurrency,
	className = '',
	showLabel = false,
	label,
	size = 'md',
	variant = 'default',
}: CurrencyDisplayProps) {
	// Validate inputs
	if (
		amount === null ||
		amount === undefined ||
		isNaN(amount) ||
		!originalCurrency ||
		!preferredCurrency
	) {
		return (
			<div className={className}>
				{showLabel && label && (
					<p
						className={`${
							size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
						} text-slate-600 dark:text-slate-400 mb-1`}
					>
						{label}
					</p>
				)}
				<span className="text-slate-500 dark:text-slate-400">N/A</span>
			</div>
		);
	}

	const needsConversion = originalCurrency !== preferredCurrency;
	const { convertedAmount, isLoading } = useCurrencyConversion(
		amount,
		originalCurrency,
		preferredCurrency,
		needsConversion
	);

	const sizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-2xl',
	};

	const fontSizes = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
	};

	const variantClasses = {
		default: 'text-slate-900 dark:text-slate-100',
		success: 'text-success-600 dark:text-success-400',
		error: 'text-error-600 dark:text-error-400',
		primary: 'text-primary-600 dark:text-primary-400',
	};

	return (
		<div className={className}>
			{showLabel && label && (
				<p className={`${fontSizes[size]} text-slate-600 dark:text-slate-400 mb-1`}>
					{label}
				</p>
			)}
			<div className="flex flex-col gap-1">
				{/* Original amount */}
				<div className="flex items-center gap-2">
					<span className={`${sizeClasses[size]} font-bold ${variantClasses[variant]}`}>
						{formatCurrency(amount, originalCurrency)}
					</span>
					{needsConversion && (
						<span className="text-xs text-slate-500 dark:text-slate-400">
							({originalCurrency})
						</span>
					)}
				</div>

				{/* Converted amount */}
				{needsConversion && (
					<div className="flex items-center gap-1.5">
						{isLoading ? (
							<>
								<ArrowPathIcon className="w-3 h-3 text-slate-400 animate-spin" />
								<span className="text-xs text-slate-500 dark:text-slate-400">
									Converting...
								</span>
							</>
						) : convertedAmount !== null ? (
							<>
								<span
									className={`${fontSizes[size]} font-medium text-primary-600 dark:text-primary-400`}
								>
									≈ {formatCurrency(convertedAmount, preferredCurrency)}
								</span>
								<span className="text-xs text-slate-500 dark:text-slate-400">
									({preferredCurrency})
								</span>
							</>
						) : null}
					</div>
				)}
			</div>
		</div>
	);
}
