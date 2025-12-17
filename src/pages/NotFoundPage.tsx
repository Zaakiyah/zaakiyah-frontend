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
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			<PageHeader title="Page Not Found" showBack={false} />
			
			<main className="px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="max-w-md mx-auto text-center"
				>
					<div className="mb-6">
						<h1 className="text-8xl font-bold text-primary-500 dark:text-primary-400 mb-2">
							404
						</h1>
						<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
							Page Not Found
						</h2>
						<p className="text-slate-600 dark:text-slate-400">
							The page you're looking for doesn't exist or has been moved.
						</p>
					</div>

					<div className="flex flex-col gap-3 mt-8">
						<button
							onClick={() => navigate('/dashboard')}
							className="w-full px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
						>
							<HomeIcon className="w-5 h-5" />
							Go to Dashboard
						</button>
						<button
							onClick={() => navigate(-1)}
							className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
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

