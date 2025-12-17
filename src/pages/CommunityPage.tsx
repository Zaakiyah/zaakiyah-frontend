import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import BottomNavigation from '../components/layout/BottomNavigation';
import NotificationIcon from '../components/ui/NotificationIcon';
import { ArrowLeftIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CommunityFeed from '../components/community/CommunityFeed';
import KnowledgeBase from '../components/community/KnowledgeBase';

type TabType = 'feed' | 'knowledge';

export default function CommunityPage() {
	useTheme();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabType>('feed');
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3 mb-3">
						<h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
							Community
						</h1>
						<div className="flex-1" />
						<NotificationIcon />
					</div>

					{/* Search Bar - Unified for both tabs */}
					<div className="mb-3">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (searchQuery.trim()) {
									navigate(
										`/community/search?q=${encodeURIComponent(
											searchQuery.trim()
										)}`
									);
								}
							}}
						>
							<div className="relative">
								<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search posts, comments, resources..."
									className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>
						</form>
					</div>

					{/* Tabs */}
					<div className="flex gap-1">
						<button
							onClick={() => setActiveTab('feed')}
							className={`flex-1 py-2 text-sm font-semibold transition-colors ${
								activeTab === 'feed'
									? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
							}`}
						>
							Feed
						</button>
						<button
							onClick={() => {
								setActiveTab('knowledge');
								setSearchQuery(''); // Clear search when switching tabs
							}}
							className={`flex-1 py-2 text-sm font-semibold transition-colors ${
								activeTab === 'knowledge'
									? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
							}`}
						>
							Knowledge
						</button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4 min-h-screen relative">
				<AnimatePresence mode="wait">
					{activeTab === 'feed' ? (
						<motion.div
							key="feed"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
						>
							<CommunityFeed searchQuery={searchQuery} />
						</motion.div>
					) : (
						<motion.div
							key="knowledge"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
						>
							<KnowledgeBase searchQuery={searchQuery} />
						</motion.div>
					)}
				</AnimatePresence>

				{/* Floating Action Button - Add Post */}
				{activeTab === 'feed' && (
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="fixed bottom-24 right-4 z-30 group"
					>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => navigate('/community/posts/new')}
							className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center overflow-hidden"
							aria-label="Create post"
							type="button"
						>
							{/* Animated background glow */}
							<motion.div
								className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-500"
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
							/>

							{/* Plus Icon */}
							<PlusIcon className="w-6 h-6 relative z-10 transform group-hover:rotate-90 transition-transform duration-300" />

							{/* Shine effect on hover */}
							<motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
						</motion.button>

						{/* Tooltip/Label */}
						<div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							Create Post
							<div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-l-4 border-l-slate-900 dark:border-l-slate-800 border-b-4 border-b-transparent" />
						</div>
					</motion.div>
				)}
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}
