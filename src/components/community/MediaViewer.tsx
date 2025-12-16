import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface MediaViewerProps {
	isOpen: boolean;
	onClose: () => void;
	mediaUrls: string[];
	initialIndex?: number;
}

export default function MediaViewer({
	isOpen,
	onClose,
	mediaUrls,
	initialIndex = 0,
}: MediaViewerProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen, initialIndex]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		const handleArrowKeys = (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === 'ArrowLeft') {
				handlePrevious();
			} else if (e.key === 'ArrowRight') {
				handleNext();
			}
		};

		document.addEventListener('keydown', handleEscape);
		document.addEventListener('keydown', handleArrowKeys);
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.removeEventListener('keydown', handleArrowKeys);
		};
	}, [isOpen, currentIndex, mediaUrls.length]);

	const handlePrevious = () => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
	};

	const currentMedia = mediaUrls[currentIndex];
	const isVideo = currentMedia?.match(/\.(mp4|webm|ogg|mov)$/i);

	if (!isOpen || mediaUrls.length === 0) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/95 z-[200] backdrop-blur-sm"
					/>

					{/* Media Viewer */}
					<div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
						{/* Close Button */}
						<button
							onClick={onClose}
							className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
							aria-label="Close"
						>
							<XMarkIcon className="w-6 h-6" />
						</button>

						{/* Navigation Buttons */}
						{mediaUrls.length > 1 && (
							<>
								<button
									onClick={handlePrevious}
									className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
									aria-label="Previous"
								>
									<ChevronLeftIcon className="w-6 h-6" />
								</button>
								<button
									onClick={handleNext}
									className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
									aria-label="Next"
								>
									<ChevronRightIcon className="w-6 h-6" />
								</button>
							</>
						)}

						{/* Media Container */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
							onClick={(e) => e.stopPropagation()}
						>
							{isVideo ? (
								<video
									src={currentMedia}
									controls
									className="max-w-full max-h-full object-contain"
									autoPlay
								>
									Your browser does not support the video tag.
								</video>
							) : (
								<img
									src={currentMedia}
									alt={`Media ${currentIndex + 1} of ${mediaUrls.length}`}
									className="max-w-full max-h-full object-contain"
								/>
							)}
						</motion.div>

						{/* Counter */}
						{mediaUrls.length > 1 && (
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
								{currentIndex + 1} / {mediaUrls.length}
							</div>
						)}
					</div>
				</>
			)}
		</AnimatePresence>
	);
}

