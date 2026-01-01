import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	showCloseButton?: boolean;
}

const sizeClasses = {
	sm: 'max-w-md',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
	full: 'max-w-full mx-4',
};

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
	showCloseButton = true,
}: ModalProps) {
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

	if (typeof window === 'undefined') {
		return null;
	}

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 z-[10000] backdrop-blur-sm"
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							onClick={(e) => e.stopPropagation()}
							className={`w-full ${sizeClasses[size]} bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-200/60 dark:border-slate-700/60 max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto`}
						>
							{/* Decorative gradient overlay */}
							<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl -z-0" />

							{/* Header */}
							{(title || showCloseButton) && (
								<div className="px-6 py-4 flex items-center justify-between border-b-2 border-primary-500/20 dark:border-primary-400/20 shrink-0 relative z-10">
									{title && (
										<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
											{title}
										</h2>
									)}
									{showCloseButton && (
										<button
											onClick={onClose}
											className="p-2 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95 ml-auto"
										>
											<XMarkIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
										</button>
									)}
								</div>
							)}

							{/* Content */}
							<div className="flex-1 overflow-y-auto px-6 py-4 relative z-10">
								{children}
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>,
		document.body
	);
}
