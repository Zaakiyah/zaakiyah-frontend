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
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
					>
						<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
							{/* Header */}
							<div className="flex items-start gap-4 mb-4">
								<div
									className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
										variant === 'danger'
											? 'bg-error-100 dark:bg-error-900/30'
											: variant === 'warning'
											? 'bg-warning-100 dark:bg-warning-900/30'
											: 'bg-info-100 dark:bg-info-900/30'
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
									<p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
								</div>
								<button
									onClick={onClose}
									className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
								>
									<XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
								</button>
							</div>

							{/* Actions */}
							<div className="flex gap-3">
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
