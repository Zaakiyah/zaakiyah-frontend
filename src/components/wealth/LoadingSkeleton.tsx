/**
 * Loading Skeleton Component for Wealth Calculation
 */

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
	type?: 'asset' | 'liability' | 'card' | 'field' | 'post';
	count?: number;
	className?: string;
}

export default function LoadingSkeleton({
	type = 'card',
	count = 1,
	className = '',
}: LoadingSkeletonProps) {
	const skeletons = Array.from({ length: count });

	const renderSkeleton = (index: number) => {
		switch (type) {
			case 'asset':
			case 'liability':
				return (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
						className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-1/3 animate-pulse" />
								<div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-1/2 animate-pulse" />
							</div>
							<div className="w-20 h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
						</div>
					</motion.div>
				);

			case 'field':
				return (
					<div key={index} className="space-y-2">
						<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-1/4 animate-pulse" />
						<div className="h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
					</div>
				);

			case 'post':
				return (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
						className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 mb-4 shadow-lg"
					>
						{/* Header */}
						<div className="flex items-start gap-3 mb-4">
							<div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-32 animate-pulse" />
								<div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-24 animate-pulse" />
							</div>
							<div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
						</div>
						{/* Content */}
						<div className="space-y-2 mb-4">
							<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-full animate-pulse" />
							<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-5/6 animate-pulse" />
							<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-4/6 animate-pulse" />
						</div>
						{/* Media placeholder */}
						<div className="h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl mb-4 animate-pulse" />
						{/* Actions */}
						<div className="flex items-center gap-6 pt-3 border-t-2 border-slate-200/60 dark:border-slate-700/60">
							<div className="h-5 w-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded animate-pulse" />
							<div className="h-5 w-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded animate-pulse" />
							<div className="flex-1" />
							<div className="h-8 w-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
						</div>
					</motion.div>
				);

			case 'card':
			default:
				return (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
						className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 space-y-4 shadow-lg"
					>
						<div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-1/3 animate-pulse" />
						<div className="space-y-2">
							<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-full animate-pulse" />
							<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-5/6 animate-pulse" />
							<div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded w-4/6 animate-pulse" />
						</div>
					</motion.div>
				);
		}
	};

	return (
		<div className={`space-y-3 ${className}`}>
			{skeletons.map((_, index) => renderSkeleton(index))}
		</div>
	);
}

