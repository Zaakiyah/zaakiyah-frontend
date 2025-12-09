import { useState } from 'react';
import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Liability } from '../../../types/wealth.types';
import { formatCurrency } from '../../../utils/currency';
import { useCurrencyStore } from '../../../store/currencyStore';
import ConfirmDialog from '../../ui/ConfirmDialog';

interface LiabilityInputFieldProps {
	liability: Liability;
	onEdit: () => void;
	onDelete: () => void;
	editable?: boolean;
}

export default function LiabilityInputField({
	liability,
	onEdit,
	onDelete,
	editable = true,
}: LiabilityInputFieldProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const { preferredCurrency } = useCurrencyStore();

	// Determine what to display
	// Show converted amount if:
	// 1. convertedAmount exists and is not null/undefined
	// 2. currency is different from preferred
	// 3. convertedAmount is a valid number (> 0)
	const needsConversion = liability.currency && liability.currency !== preferredCurrency;
	const hasConversion =
		needsConversion &&
		liability.convertedAmount !== undefined &&
		liability.convertedAmount !== null &&
		!isNaN(liability.convertedAmount) &&
		liability.convertedAmount > 0;

	const displayAmount = hasConversion ? liability.convertedAmount! : liability.amount;
	const displayCurrency = hasConversion
		? preferredCurrency
		: liability.currency || preferredCurrency;
	const showOriginalCurrency = hasConversion && needsConversion;

	const getLiabilityTypeLabel = (type: Liability['type']): string => {
		const labels: Record<Liability['type'], string> = {
			loan: 'Loan',
			creditCard: 'Credit Card',
			bills: 'Bills',
			rent: 'Rent',
			other: 'Other',
			custom: (liability as any).title || 'Custom Liability',
		};
		return labels[type] || 'Liability';
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
						{getLiabilityTypeLabel(liability.type)}
					</h3>
					{showOriginalCurrency && (
						<span className="text-xs text-slate-500 dark:text-slate-400">
							({liability.currency})
						</span>
					)}
				</div>

				<div className="flex items-baseline gap-2">
					<span className="text-lg font-bold text-slate-900 dark:text-slate-100">
						{formatCurrency(displayAmount, displayCurrency)}
					</span>
					{showOriginalCurrency && liability.convertedAmount !== undefined && (
						<span className="text-xs text-slate-500 dark:text-slate-400">
							({formatCurrency(liability.amount, liability.currency)})
						</span>
					)}
				</div>
			</div>

			{editable && (
				<div className="flex items-center gap-2 ml-4">
					<button
						onClick={onEdit}
						className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
						aria-label="Edit liability"
					>
						<PencilIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
					</button>
					<button
						onClick={() => setShowDeleteConfirm(true)}
						className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors active:scale-95"
						aria-label="Delete liability"
					>
						<TrashIcon className="w-4 h-4 text-error-600 dark:text-error-400" />
					</button>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={onDelete}
				title="Delete Liability"
				message={`Are you sure you want to delete "${getLiabilityTypeLabel(
					liability.type
				)}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
			/>
		</motion.div>
	);
}
