import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

interface ComingSoonProps {
	/** Message to display */
	message?: string;
	/** Variant: 'page' for full page, 'section' for inline sections */
	variant?: 'page' | 'section';
	/** Custom className */
	className?: string;
	/** Icon to display (optional, defaults to ClockIcon) */
	icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Reusable "Coming Soon" component for pages or sections that aren't implemented yet
 * Supports both full page and inline section variants
 */
export default function ComingSoon({
	message = 'Coming soon',
	variant = 'page',
	className = '',
	icon: Icon = ClockIcon,
}: ComingSoonProps) {
	if (variant === 'page') {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={`bg-white dark:bg-slate-800 rounded-xl p-8 sm:p-12 shadow-sm border border-slate-200/60 dark:border-slate-700/60 text-center ${className}`}
			>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="flex justify-center mb-4"
				>
					<div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
						<Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
					</div>
				</motion.div>
				<motion.h3
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
				>
					{message}
				</motion.h3>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="text-sm text-slate-500 dark:text-slate-400"
				>
					We're working hard to bring you this feature soon.
				</motion.p>
			</motion.div>
		);
	}

	// Section variant - more compact for inline use
	return (
		<div className={`text-center py-2 ${className}`}>
			<p className="text-xs text-slate-400 dark:text-slate-500">{message}</p>
		</div>
	);
}



