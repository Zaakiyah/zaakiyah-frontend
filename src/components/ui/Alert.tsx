import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import {
	InformationCircleIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	message: string;
	variant?: AlertVariant;
	showIcon?: boolean;
	autoClose?: boolean;
	autoCloseDelay?: number;
}

const variantStyles = {
	info: {
		iconBg: 'bg-primary-100 dark:bg-primary-900/20',
		iconColor: 'text-primary-600 dark:text-primary-400',
		defaultIcon: InformationCircleIcon,
	},
	success: {
		iconBg: 'bg-green-100 dark:bg-green-900/20',
		iconColor: 'text-green-600 dark:text-green-400',
		defaultIcon: CheckCircleIcon,
	},
	warning: {
		iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
		iconColor: 'text-yellow-600 dark:text-yellow-400',
		defaultIcon: ExclamationTriangleIcon,
	},
	error: {
		iconBg: 'bg-error-100 dark:bg-error-900/20',
		iconColor: 'text-error-600 dark:text-error-400',
		defaultIcon: XCircleIcon,
	},
};

export default function Alert({
	isOpen,
	onClose,
	title,
	message,
	variant = 'info',
	showIcon = true,
	autoClose = false,
	autoCloseDelay = 3000,
}: AlertProps) {
	useTheme();
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

	useEffect(() => {
		if (isOpen && autoClose) {
			const timer = setTimeout(() => {
				onClose();
			}, autoCloseDelay);

			return () => clearTimeout(timer);
		}
	}, [isOpen, autoClose, autoCloseDelay, onClose]);

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
						onClick={handleBackdropClick}
					/>

					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: 'spring', stiffness: 300, damping: 25 }}
							className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-2 border-slate-200/60 dark:border-slate-700/60 w-full max-w-sm pointer-events-auto overflow-hidden"
						>
							{/* Decorative gradient overlay */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl -z-0" />
							
							<div className="p-6 relative z-10">
								{showIcon && (
									<div className="flex justify-center mb-4">
										<div
											className={`w-14 h-14 rounded-2xl ${variantStyle.iconBg} flex items-center justify-center shadow-lg`}
										>
											<DefaultIcon
												className={`w-6 h-6 ${variantStyle.iconColor}`}
											/>
										</div>
									</div>
								)}

								{title && (
									<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
										{title}
									</h3>
								)}

								<p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed">
									{message}
								</p>

								<Button
									type="button"
									variant="primary"
									onClick={onClose}
									className="w-full"
								>
									OK
								</Button>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}

