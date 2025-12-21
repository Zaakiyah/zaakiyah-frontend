import { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

	const bottomSheetContent = (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 z-[9999] backdrop-blur-sm"
					/>

					{/* Bottom Sheet */}
					<motion.div
						initial={{ y: '100%' }}
						animate={{ y: 0 }}
						exit={{ y: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed inset-x-0 bottom-0 z-[9999] bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
						style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
					>
						{/* Decorative gradient overlay */}
						<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl -z-0" />

						{/* Handle Bar */}
						<div className="pt-3 pb-2 shrink-0 relative z-10">
							<div className="w-12 h-1.5 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full mx-auto" />
						</div>

						{/* Header */}
						<div className="px-4 pb-3 flex items-center justify-between border-b-2 border-primary-500/20 dark:border-primary-400/20 shrink-0 relative z-10">
							<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								{title}
							</h2>
							<button
								onClick={onClose}
								className="p-2 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95"
							>
								<XMarkIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-4 py-4 relative z-10">
							{children}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);

	// Render to portal to ensure it's above all other elements
	if (typeof window !== 'undefined') {
		return createPortal(bottomSheetContent, document.body);
	}

	return null;
}
