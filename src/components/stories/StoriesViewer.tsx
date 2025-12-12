import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { impactStories } from '../../data/impactStories';

interface StoriesViewerProps {
	isOpen: boolean;
	onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export default function StoriesViewer({ isOpen, onClose }: StoriesViewerProps) {
	const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const currentStory = impactStories[currentStoryIndex];
	const totalStories = impactStories.length;

	const nextStory = () => {
		setCurrentStoryIndex((prev) => (prev + 1) % totalStories);
		setProgress(0);
	};

	const prevStory = () => {
		setCurrentStoryIndex((prev) => (prev - 1 + totalStories) % totalStories);
		setProgress(0);
	};

	useEffect(() => {
		if (!isOpen) {
			setCurrentStoryIndex(0);
			setProgress(0);
			return;
		}

		// Reset progress when story changes
		setProgress(0);

		// Progress bar animation
		progressIntervalRef.current = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					return 0;
				}
				return prev + (100 / (STORY_DURATION / 50)); // Update every 50ms
			});
		}, 50);

		// Auto-advance story
		intervalRef.current = setTimeout(() => {
			nextStory();
		}, STORY_DURATION);

		return () => {
			if (intervalRef.current) clearTimeout(intervalRef.current);
			if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
		};
	}, [isOpen, currentStoryIndex]);

	const goToStory = (index: number) => {
		setCurrentStoryIndex(index);
		setProgress(0);
	};

	const handleClose = () => {
		if (intervalRef.current) clearTimeout(intervalRef.current);
		if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onClick={handleClose}
				>
					<motion.div
						className="relative w-full max-w-lg h-[85vh] bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 dark:from-slate-900 dark:via-primary-900 dark:to-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/10"
						initial={{ scale: 0.95, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Gradient overlay for depth */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-10" />

						{/* Progress bars - Modern design */}
						<div className="absolute top-0 left-0 right-0 flex gap-1.5 p-4 z-30">
							{impactStories.map((_, index) => (
								<button
									key={index}
									className="flex-1 h-1 bg-white/20 dark:bg-white/20 rounded-full overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
									onClick={(e) => {
										e.stopPropagation();
										goToStory(index);
									}}
									aria-label={`Go to story ${index + 1}`}
								>
									<motion.div
										className="h-full bg-white dark:bg-white rounded-full shadow-lg"
										initial={{ width: index < currentStoryIndex ? '100%' : '0%' }}
										animate={{
											width:
												index < currentStoryIndex
													? '100%'
													: index === currentStoryIndex
														? `${progress}%`
														: '0%',
										}}
										transition={{ duration: 0.1, ease: 'linear' }}
									/>
								</button>
							))}
						</div>

						{/* Close button - Modern design */}
						<motion.button
							onClick={handleClose}
							className="absolute top-4 right-4 z-30 p-2.5 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 dark:hover:bg-white/20 transition-all hover:scale-110 active:scale-95 border border-white/20 dark:border-white/20"
							aria-label="Close stories"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
						>
							<XMarkIcon className="w-5 h-5" />
						</motion.button>

						{/* Story content */}
						<div className="h-full flex flex-col pt-16 pb-8 px-6 md:px-8 text-white overflow-y-auto relative z-20">
							{/* Author info - Enhanced */}
							<motion.div
								key={currentStoryIndex}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="flex items-center gap-4 mb-6"
							>
								<div
									className={`w-14 h-14 rounded-2xl ${currentStory.author.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20 dark:ring-white/20`}
								>
									{currentStory.author.avatar}
								</div>
								<div>
									<p className="font-bold text-lg">{currentStory.author.name}</p>
									<p className="text-sm text-white/70 dark:text-white/70">{currentStory.author.role}</p>
								</div>
							</motion.div>

							{/* Story title - Enhanced */}
							<motion.h2
								key={`title-${currentStoryIndex}`}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.15 }}
								className="text-3xl md:text-4xl font-bold mb-5 leading-tight"
							>
								{currentStory.title}
							</motion.h2>

							{/* Story content - Enhanced */}
							<motion.p
								key={`content-${currentStoryIndex}`}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="text-base md:text-lg leading-relaxed mb-8 text-white/90 dark:text-white/90"
							>
								{currentStory.content}
							</motion.p>

							{/* Stats - Modern card design */}
							{currentStory.stats && (
								<motion.div
									key={`stats-${currentStoryIndex}`}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.25 }}
									className="mt-auto bg-white/10 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/20 shadow-xl"
								>
									<p className="text-sm font-medium text-white/70 dark:text-white/70 mb-2 uppercase tracking-wide">
										{currentStory.stats.label}
									</p>
									<p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/80 dark:from-white dark:to-white/80 bg-clip-text text-transparent">
										{currentStory.stats.value}
									</p>
								</motion.div>
							)}

							{/* Story number indicator - Modern */}
							<motion.div
								key={`counter-${currentStoryIndex}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="text-center"
							>
								<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/20 dark:border-white/20">
									<span className="text-sm font-medium text-white/90 dark:text-white/90">
										{currentStoryIndex + 1}
									</span>
									<span className="w-1 h-1 rounded-full bg-white/50 dark:bg-white/50" />
									<span className="text-sm font-medium text-white/60 dark:text-white/60">
										{totalStories}
									</span>
								</div>
							</motion.div>
						</div>

						{/* Navigation buttons - Modern design */}
						<motion.button
							onClick={(e) => {
								e.stopPropagation();
								prevStory();
							}}
							className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 dark:hover:bg-white/20 transition-all hover:scale-110 active:scale-95 border border-white/20 dark:border-white/20 shadow-lg"
							aria-label="Previous story"
							whileHover={{ scale: 1.1, x: -2 }}
							whileTap={{ scale: 0.95 }}
						>
							<ChevronLeftIcon className="w-6 h-6" />
						</motion.button>

						<motion.button
							onClick={(e) => {
								e.stopPropagation();
								nextStory();
							}}
							className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 dark:hover:bg-white/20 transition-all hover:scale-110 active:scale-95 border border-white/20 dark:border-white/20 shadow-lg"
							aria-label="Next story"
							whileHover={{ scale: 1.1, x: 2 }}
							whileTap={{ scale: 0.95 }}
						>
							<ChevronRightIcon className="w-6 h-6" />
						</motion.button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

