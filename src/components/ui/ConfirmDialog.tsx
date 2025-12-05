import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import {
	ExclamationTriangleIcon,
	InformationCircleIcon,
	CheckCircleIcon,
} from '@heroicons/react/24/outline';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	message: string;
	variant?: ConfirmDialogVariant;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
	icon?: React.ReactNode;
}

const variantStyles = {
	danger: {
		iconBg: 'bg-error-100',
		iconColor: 'text-error-600',
		buttonVariant: 'danger' as const,
		defaultIcon: ExclamationTriangleIcon,
	},
	warning: {
		iconBg: 'bg-yellow-100',
		iconColor: 'text-yellow-600',
		buttonVariant: 'outline' as const,
		defaultIcon: ExclamationTriangleIcon,
	},
	info: {
		iconBg: 'bg-primary-100',
		iconColor: 'text-primary-600',
		buttonVariant: 'primary' as const,
		defaultIcon: InformationCircleIcon,
	},
	success: {
		iconBg: 'bg-green-100',
		iconColor: 'text-green-600',
		buttonVariant: 'primary' as const,
		defaultIcon: CheckCircleIcon,
	},
};

export default function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	variant = 'warning',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	isLoading = false,
	icon,
}: ConfirmDialogProps) {
	const variantStyle = variantStyles[variant];
	const DefaultIcon = variantStyle.defaultIcon;

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

	const handleConfirm = async () => {
		await onConfirm();
	};

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget && !isLoading) {
			onClose();
		}
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
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
						onClick={handleBackdropClick}
					/>

					{/* Dialog */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 w-full max-w-sm pointer-events-auto"
						>
							<div className="p-6">
								{/* Icon */}
								<div className="flex justify-center mb-4">
									<div
										className={`w-12 h-12 rounded-full ${variantStyle.iconBg} dark:${variantStyle.iconBg.replace('100', '900/30')} flex items-center justify-center`}
									>
										{icon || (
											<DefaultIcon
												className={`w-6 h-6 ${variantStyle.iconColor} dark:${variantStyle.iconColor.replace('600', '400')}`}
											/>
										)}
									</div>
								</div>

								{/* Title */}
								<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
									{title}
								</h3>

								{/* Message */}
								<p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">{message}</p>

								{/* Actions */}
								<div className="flex gap-3">
									<Button
										type="button"
										variant="outline"
										onClick={onClose}
										className="flex-1"
										disabled={isLoading}
									>
										{cancelText}
									</Button>
									<Button
										type="button"
										variant={variantStyle.buttonVariant}
										onClick={handleConfirm}
										className="flex-1"
										isLoading={isLoading}
									>
										{confirmText}
									</Button>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
