import { useState } from 'react';
import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../../../types/wealth.types';
import { formatCurrency } from '../../../utils/currency';
import { useCurrencyStore } from '../../../store/currencyStore';
import ConfirmDialog from '../../ui/ConfirmDialog';

interface AssetInputFieldProps {
	asset: Asset;
	onEdit: () => void;
	onDelete: () => void;
	onUpdate?: (updates: Partial<Asset>) => void;
	editable?: boolean;
}

export default function AssetInputField({
	asset,
	onEdit,
	onDelete,
	onUpdate,
	editable = true,
}: AssetInputFieldProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const { preferredCurrency } = useCurrencyStore();

	// Determine what to display
	// Show converted amount if:
	// 1. convertedAmount exists and is not null/undefined
	// 2. currency is different from preferred
	// 3. convertedAmount is a valid number (> 0)
	const needsConversion = asset.currency && asset.currency !== preferredCurrency;
	const hasConversion =
		needsConversion &&
		asset.convertedAmount !== undefined &&
		asset.convertedAmount !== null &&
		!isNaN(asset.convertedAmount) &&
		asset.convertedAmount > 0;

	const displayAmount = hasConversion ? asset.convertedAmount! : asset.amount;
	const displayCurrency = hasConversion ? preferredCurrency : asset.currency || preferredCurrency;
	const showOriginalCurrency = hasConversion && needsConversion;

	const getAssetTypeLabel = (type: Asset['type']): string => {
		const labels: Record<Asset['type'], string> = {
			cash: 'Cash',
			bank: 'Bank Savings',
			stocks: 'Stocks/Investments',
			business: 'Business Assets',
			gold: 'Gold',
			silver: 'Silver',
			livestock: 'Livestock',
			farmProduce: 'Farm Produce',
			custom: (asset as any).title || 'Custom Asset',
		};
		return labels[type] || 'Asset';
	};

	const getAssetDetails = (): string => {
		if (asset.type === 'gold' || asset.type === 'silver') {
			const goldSilverAsset = asset as any;
			return `${goldSilverAsset.weight}g @ ${formatCurrency(
				goldSilverAsset.pricePerGram,
				displayCurrency
			)}/g`;
		}
		if (asset.type === 'livestock') {
			const livestockAsset = asset as any;
			const count = livestockAsset.count || 0;
			const type = livestockAsset.livestockType || 'Unknown';
			return count > 0 ? `${count} ${type}` : '';
		}
		return '';
	};

	const handleSave = () => {
		setIsEditing(false);
		// onUpdate would be called from edit form
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	if (isEditing && onUpdate) {
		// Edit mode - would show edit form
		// For now, just show placeholder
		return (
			<div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-primary-300 dark:border-primary-700">
				<p className="text-sm text-slate-600 dark:text-slate-400">Edit form coming soon</p>
				<div className="flex gap-2 mt-3">
					<button
						onClick={handleSave}
						className="px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600"
					>
						Save
					</button>
					<button
						onClick={handleCancel}
						className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
					>
						Cancel
					</button>
				</div>
			</div>
		);
	}

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
						{getAssetTypeLabel(asset.type)}
					</h3>
					{showOriginalCurrency && (
						<span className="text-xs text-slate-500 dark:text-slate-400">
							({asset.currency})
						</span>
					)}
				</div>

				{getAssetDetails() && (
					<p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
						{getAssetDetails()}
					</p>
				)}

				<div className="flex items-baseline gap-2">
					<span className="text-lg font-bold text-slate-900 dark:text-slate-100">
						{formatCurrency(displayAmount, displayCurrency)}
					</span>
					{showOriginalCurrency && asset.convertedAmount !== undefined && (
						<span className="text-xs text-slate-500 dark:text-slate-400">
							({formatCurrency(asset.amount, asset.currency)})
						</span>
					)}
				</div>
			</div>

			{editable && (
				<div className="flex items-center gap-2 ml-4">
					<button
						onClick={onEdit}
						className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95"
						aria-label="Edit asset"
					>
						<PencilIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
					</button>
					<button
						onClick={() => setShowDeleteConfirm(true)}
						className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors active:scale-95"
						aria-label="Delete asset"
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
				title="Delete Asset"
				message={`Are you sure you want to delete "${getAssetTypeLabel(
					asset.type
				)}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
			/>
		</motion.div>
	);
}
