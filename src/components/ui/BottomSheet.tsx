import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

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
						className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
					/>

					{/* Bottom Sheet */}
					<motion.div
						initial={{ y: '100%' }}
						animate={{ y: 0 }}
						exit={{ y: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
					>
						{/* Handle Bar */}
						<div className="pt-3 pb-2 flex-shrink-0">
							<div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />
						</div>

						{/* Header */}
						<div className="px-4 pb-3 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
							<h2 className="text-lg font-bold text-slate-900">{title}</h2>
							<button
								onClick={onClose}
								className="p-2 rounded-lg hover:bg-slate-100 transition-colors active:scale-95"
							>
								<XMarkIcon className="w-5 h-5 text-slate-700" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

