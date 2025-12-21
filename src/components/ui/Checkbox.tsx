import { CheckIcon } from '@heroicons/react/24/solid';

interface CheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label?: React.ReactNode;
	className?: string;
	disabled?: boolean;
}

export default function Checkbox({
	checked,
	onChange,
	label,
	className = '',
	disabled = false,
}: CheckboxProps) {
	return (
		<label
			className={`flex items-start gap-3 cursor-pointer group ${
				disabled ? 'opacity-50 cursor-not-allowed' : ''
			} ${className}`}
		>
			<div className="relative shrink-0 mt-0.5">
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => {
						if (!disabled) {
							onChange(e.target.checked);
						}
					}}
					disabled={disabled}
					className="sr-only"
					aria-checked={checked}
				/>
				<div
					className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
						checked
							? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 border-primary-600 dark:border-primary-700 shadow-md shadow-primary-500/30 dark:shadow-primary-600/30'
							: 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 group-hover:border-primary-400 dark:group-hover:border-primary-500 shadow-sm'
					} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
					role="checkbox"
					aria-checked={checked}
				>
					{checked && (
						<CheckIcon className="w-3.5 h-3.5 text-white transition-all duration-200" />
					)}
				</div>
			</div>
			{label && (
				<span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
					{label}
				</span>
			)}
		</label>
	);
}
