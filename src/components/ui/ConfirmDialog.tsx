import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'warning' | 'info';
	isLoading?: boolean;
	confirmVariant?: 'danger' | 'primary' | 'error';
}

export default function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'danger',
	isLoading = false,
	confirmVariant,
}: ConfirmDialogProps) {
	const handleConfirm = async () => {
		await onConfirm();
		onClose();
	};

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

					{/* Dialog */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
					>
						<div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
							{/* Decorative gradient overlay */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl -z-0" />
							
							{/* Header */}
							<div className="flex items-start gap-4 mb-4 relative z-10">
								<div
									className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
										variant === 'danger'
											? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/20'
											: variant === 'warning'
											? 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20'
											: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20'
									}`}
								>
									<ExclamationTriangleIcon
										className={`w-6 h-6 ${
											variant === 'danger'
												? 'text-error-600 dark:text-error-400'
												: variant === 'warning'
												? 'text-warning-600 dark:text-warning-400'
												: 'text-info-600 dark:text-info-400'
										}`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
										{title}
									</h3>
									<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
								</div>
								<button
									onClick={onClose}
									className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all shrink-0"
								>
									<XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
								</button>
							</div>

							{/* Actions */}
							<div className="flex gap-3 relative z-10">
								<Button
									variant="outline"
									onClick={onClose}
									className="flex-1"
									disabled={isLoading}
								>
									{cancelText}
								</Button>
								<Button
									variant={
										confirmVariant === 'error' || confirmVariant === 'danger' || variant === 'danger'
											? 'danger'
											: 'primary'
									}
									onClick={handleConfirm}
									className="flex-1"
									disabled={isLoading}
									isLoading={isLoading}
								>
									{confirmText}
								</Button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
