import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, ComputerDesktopIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useThemeStore, type ThemeMode } from '../../store/themeStore';

interface ThemeOption {
	value: ThemeMode;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

const themeOptions: ThemeOption[] = [
	{
		value: 'light',
		label: 'Light',
		description: 'Always use light mode',
		icon: SunIcon,
	},
	{
		value: 'dark',
		label: 'Dark',
		description: 'Always use dark mode',
		icon: MoonIcon,
	},
	{
		value: 'system',
		label: 'System',
		description: 'Match your device settings',
		icon: ComputerDesktopIcon,
	},
];

interface ThemeSelectorProps {
	value?: ThemeMode;
	onChange?: (theme: ThemeMode) => void;
	disabled?: boolean;
	className?: string;
}

export default function ThemeSelector({
	value,
	onChange,
	disabled = false,
	className = '',
}: ThemeSelectorProps) {
	const { theme: storeTheme, setTheme: setStoreTheme } = useThemeStore();
	const currentTheme = value || storeTheme;

	// Force re-render when theme changes
	useEffect(() => {
		// This ensures the component updates when the store theme changes
	}, [storeTheme]);

	const handleThemeChange = (newTheme: ThemeMode) => {
		if (disabled) return;

		if (onChange) {
			onChange(newTheme);
		} else {
			setStoreTheme(newTheme);
		}
	};

	return (
		<div className={`space-y-2 ${className}`}>
			{themeOptions.map((option) => {
				const Icon = option.icon;
				const isSelected = currentTheme === option.value;

				return (
					<motion.button
						key={option.value}
						type="button"
						onClick={() => handleThemeChange(option.value)}
						disabled={disabled}
						whileTap={!disabled ? { scale: 0.98 } : {}}
						className={`
							w-full px-4 py-3 rounded-lg border-2 transition-all
							flex items-center gap-3
							${
								isSelected
									? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
									: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
							}
							${
								disabled
									? 'opacity-60 cursor-not-allowed'
									: 'hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer'
							}
						`}
					>
						<div
							className={`
								w-10 h-10 rounded-lg flex items-center justify-center shrink-0
								${isSelected ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-slate-100 dark:bg-slate-700'}
							`}
						>
							<Icon
								className={`
									w-5 h-5
									${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}
								`}
							/>
						</div>
						<div className="flex-1 text-left min-w-0">
							<div
								className={`
									text-sm font-semibold mb-0.5
									${isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-slate-900 dark:text-slate-100'}
								`}
							>
								{option.label}
							</div>
							<div
								className={`
									text-xs
									${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400'}
								`}
							>
								{option.description}
							</div>
						</div>
						{isSelected && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="shrink-0"
							>
								<CheckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
							</motion.div>
						)}
					</motion.button>
				);
			})}
		</div>
	);
}
