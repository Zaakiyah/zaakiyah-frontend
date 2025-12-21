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
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', stiffness: 100 }}
			className={`text-center py-12 px-4 ${className}`}
		>
			{icon && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
					className="flex justify-center mb-6"
				>
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-primary-400/10 rounded-full blur-2xl" />
						<div className="relative">
							{icon}
						</div>
					</div>
				</motion.div>
			)}
			<h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
				{title}
			</h3>
			<p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
				{description}
			</p>
			{action && (
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={action.onClick}
					className="px-6 py-3 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
				>
					{action.label}
				</motion.button>
			)}
		</motion.div>
	);
}

