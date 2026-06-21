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
						whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
						whileTap={!disabled ? { scale: 0.98 } : {}}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
						className={`
							w-full px-4 py-3 rounded-xl border-2 transition-all
							flex items-center gap-3 shadow-sm hover:shadow-md
							${
								isSelected
									? 'border-primary-500 dark:border-primary-400 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 shadow-md shadow-primary-500/20 dark:shadow-primary-600/20'
									: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
							}
							${
								disabled
									? 'opacity-60 cursor-not-allowed'
									: 'cursor-pointer'
							}
						`}
					>
						<div
							className={`
								w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md
								${isSelected ? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 shadow-primary-500/30 dark:shadow-primary-600/30' : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'}
							`}
						>
							<Icon
								className={`
									w-6 h-6
									${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}
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
