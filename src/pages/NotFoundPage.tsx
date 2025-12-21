import { useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';

export default function NotFoundPage() {
	useTheme();
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			<PageHeader title="Page Not Found" showBack={false} />
			
			<main className="px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: 'spring', stiffness: 100 }}
					className="relative max-w-md mx-auto text-center"
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-400/5 rounded-full blur-3xl -z-0" />
					
					<div className="mb-8 relative z-10">
						<motion.h1
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
							className="text-8xl font-bold bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent mb-4"
						>
							404
						</motion.h1>
						<h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
							Page Not Found
						</h2>
						<p className="text-slate-600 dark:text-slate-400 leading-relaxed">
							The page you're looking for doesn't exist or has been moved.
						</p>
					</div>

					<div className="flex flex-col gap-3 mt-8 relative z-10">
						<button
							onClick={() => navigate('/dashboard')}
							className="w-full px-4 py-3.5 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 dark:shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-500/40"
						>
							<HomeIcon className="w-5 h-5" />
							Go to Dashboard
						</button>
						<button
							onClick={() => navigate(-1)}
							className="w-full px-4 py-3.5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
						>
							<ArrowLeftIcon className="w-5 h-5" />
							Go Back
						</button>
					</div>
				</motion.div>
			</main>

			<BottomNavigation />
		</div>
	);
}

