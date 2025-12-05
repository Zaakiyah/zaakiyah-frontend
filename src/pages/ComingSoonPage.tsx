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
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			<PageHeader title={title} showBack />
			<main className="px-4 py-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-slate-800 rounded-xl p-8 sm:p-12 shadow-sm border border-slate-200/60 dark:border-slate-700/60 text-center"
				>
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="flex justify-center mb-4"
					>
						<div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
							<ClockIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
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
						{description}
					</motion.p>
				</motion.div>
			</main>
			<BottomNavigation />
		</div>
	);
}

