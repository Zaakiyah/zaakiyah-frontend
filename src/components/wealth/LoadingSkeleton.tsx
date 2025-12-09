/**
 * Loading Skeleton Component for Wealth Calculation
 */

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
	type?: 'asset' | 'liability' | 'card' | 'field';
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
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
					>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
								<div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
							</div>
							<div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
						</div>
					</motion.div>
				);

			case 'field':
				return (
					<div key={index} className="space-y-2">
						<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse" />
						<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
					</div>
				);

			case 'card':
			default:
				return (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4"
					>
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
						<div className="space-y-2">
							<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse" />
							<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse" />
							<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6 animate-pulse" />
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

