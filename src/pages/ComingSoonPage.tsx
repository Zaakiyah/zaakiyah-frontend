import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';

interface ComingSoonPageProps {
	/** Page title to display in header */
	title: string;
	/** Custom message (optional) */
	message?: string;
	/** Description text (optional) */
	description?: string;
}

/**
 * Full-page "Coming Soon" component for routes that aren't implemented yet
 */
export default function ComingSoonPage({
	title,
	message = 'Coming soon',
	description = "We're working hard to bring you this feature soon.",
}: ComingSoonPageProps) {

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			<PageHeader title={title} showBack />
			<main className="px-4 py-4">
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 sm:p-12 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 text-center overflow-hidden"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
					
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
						className="flex justify-center mb-6 relative z-10"
					>
						<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center shadow-lg shadow-primary-500/20 dark:shadow-primary-600/20">
							<ClockIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
						</div>
					</motion.div>
					<motion.h3
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 relative z-10"
					>
						{message}
					</motion.h3>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10"
					>
						{description}
					</motion.p>
				</motion.div>
			</main>
			<BottomNavigation />
		</div>
	);
}

