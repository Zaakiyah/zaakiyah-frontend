import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { impactStories, type ImpactStory } from '../../data/impactStories';

interface StoriesViewerProps {
	isOpen: boolean;
	onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export default function StoriesViewer({ isOpen, onClose }: StoriesViewerProps) {
	const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
					className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={handleClose}
				>
					<motion.div
						className="relative w-full h-full max-w-md max-h-[90vh] bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 rounded-2xl overflow-hidden shadow-2xl"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Progress bars */}
						<div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
							{impactStories.map((_, index) => (
								<div
									key={index}
									className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
									onClick={(e) => {
										e.stopPropagation();
										goToStory(index);
									}}
								>
									<motion.div
										className="h-full bg-white rounded-full"
										initial={{ width: index < currentStoryIndex ? '100%' : '0%' }}
										animate={{
											width:
												index < currentStoryIndex
													? '100%'
													: index === currentStoryIndex
														? `${progress}%`
														: '0%',
										}}
										transition={{ duration: 0.1 }}
									/>
								</div>
							))}
						</div>

						{/* Close button */}
						<button
							onClick={handleClose}
							className="absolute top-4 right-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
							aria-label="Close stories"
						>
							<XMarkIcon className="w-5 h-5" />
						</button>

						{/* Story content */}
						<div className="h-full flex flex-col pt-12 pb-8 px-6 text-white overflow-y-auto">
							{/* Author info */}
							<div className="flex items-center gap-3 mb-6">
								<div
									className={`w-12 h-12 rounded-full ${currentStory.author.avatarColor} flex items-center justify-center text-white font-semibold text-lg`}
								>
									{currentStory.author.avatar}
								</div>
								<div>
									<p className="font-semibold text-lg">{currentStory.author.name}</p>
									<p className="text-sm text-white/80">{currentStory.author.role}</p>
								</div>
							</div>

							{/* Story title */}
							<h2 className="text-2xl font-bold mb-4">{currentStory.title}</h2>

							{/* Story content */}
							<p className="text-base leading-relaxed mb-6 text-white/90">{currentStory.content}</p>

							{/* Stats */}
							{currentStory.stats && (
								<div className="mt-auto bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
									<p className="text-sm text-white/80 mb-1">{currentStory.stats.label}</p>
									<p className="text-3xl font-bold">{currentStory.stats.value}</p>
								</div>
							)}

							{/* Story number indicator */}
							<div className="text-center text-sm text-white/60">
								{currentStoryIndex + 1} of {totalStories}
							</div>
						</div>

						{/* Navigation buttons */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								prevStory();
							}}
							className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
							aria-label="Previous story"
						>
							<ChevronLeftIcon className="w-6 h-6" />
						</button>

						<button
							onClick={(e) => {
								e.stopPropagation();
								nextStory();
							}}
							className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
							aria-label="Next story"
						>
							<ChevronRightIcon className="w-6 h-6" />
						</button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

