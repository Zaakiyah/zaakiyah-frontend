/**
 * Empty State Component for Wealth Calculation
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export default function EmptyState({
	icon,
	title,
	description,
	action,
	className = '',
}: EmptyStateProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={`text-center py-12 px-4 ${className}`}
		>
			{icon && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.1, type: 'spring' }}
					className="flex justify-center mb-4"
				>
					{icon}
				</motion.div>
			)}
			<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
				{title}
			</h3>
			<p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
				{description}
			</p>
			{action && (
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={action.onClick}
					className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
				>
					{action.label}
				</motion.button>
			)}
		</motion.div>
	);
}

