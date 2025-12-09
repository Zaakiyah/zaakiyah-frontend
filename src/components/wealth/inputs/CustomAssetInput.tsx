import { useState, useEffect } from 'react';
import BottomSheet from '../../ui/BottomSheet';
import Input from '../../ui/Input';
import CurrencyInput from './CurrencyInput';
import Button from '../../ui/Button';
import { generateId } from '../../../services/wealthCalculationService';
import type { CustomAsset, CustomLiability } from '../../../types/wealth.types';

interface CustomAssetInputProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (asset: CustomAsset | CustomLiability) => void;
	type: 'asset' | 'liability';
	existingItem?: CustomAsset | CustomLiability;
}

export default function CustomAssetInput({
	isOpen,
	onClose,
	onSave,
	type,
	existingItem,
}: CustomAssetInputProps) {
	const [title, setTitle] = useState('');
	const [amount, setAmount] = useState(0);
	const [currency, setCurrency] = useState<string | undefined>(undefined);
	const [convertedAmount, setConvertedAmount] = useState<number | undefined>(undefined);
	const [description, setDescription] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			if (existingItem && existingItem.type === 'custom') {
				setTitle(existingItem.title || '');
				setAmount(existingItem.amount || 0);
				setCurrency(existingItem.currency);
				setConvertedAmount(existingItem.convertedAmount);
				setDescription(existingItem.description || '');
			} else {
				setTitle('');
				setAmount(0);
				setCurrency(undefined);
				setConvertedAmount(undefined);
				setDescription('');
			}
		}
	}, [isOpen, existingItem]);

	const handleSave = () => {
		// Validation
		if (!title.trim()) {
			setError('Title is required');
			return;
		}

		if (amount <= 0) {
			setError('Amount must be greater than 0');
			return;
		}

		setError(null);

		if (type === 'asset') {
			const customAsset: CustomAsset = {
				id: existingItem?.id || generateId(),
				type: 'custom',
				title: title.trim(),
				amount,
				currency,
				convertedAmount,
				description: description || undefined,
				category: undefined,
			};
			onSave(customAsset);
		} else {
			const customLiability: CustomLiability = {
				id: existingItem?.id || generateId(),
				type: 'custom',
				title: title.trim(),
				amount,
				currency,
				convertedAmount,
				description: description || undefined,
			};
			onSave(customLiability);
		}

		// Reset form
		setTitle('');
		setAmount(0);
		setCurrency(undefined);
		setDescription('');
		setError(null);
		onClose();
	};

	const handleClose = () => {
		setError(null);
		if (!existingItem) {
			// Reset form only if it's a new item
			setTitle('');
			setAmount(0);
			setCurrency(undefined);
			setDescription('');
		}
		onClose();
	};

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={handleClose}
			title={`${existingItem ? 'Edit' : 'Add'} Custom ${
				type === 'asset' ? 'Asset' : 'Liability'
			}`}
		>
			<div className="space-y-4 pb-4">
				{error && (
					<div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
						<p className="text-sm text-error-600 dark:text-error-400">{error}</p>
					</div>
				)}

				<Input
					label="Title"
					placeholder={`Enter ${type === 'asset' ? 'asset' : 'liability'} name`}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					error={error && !title.trim() ? error : undefined}
				/>

				<CurrencyInput
					label="Amount"
					value={amount}
					currency={currency}
					onAmountChange={(newAmount) => {
						setAmount(newAmount);
						// Clear converted amount when amount changes - it will be recalculated
						setConvertedAmount(undefined);
					}}
					onCurrencyChange={(newCurrency) => {
						setCurrency(newCurrency);
						// Clear converted amount when currency changes - it will be recalculated
						setConvertedAmount(undefined);
					}}
					onConversionComplete={(converted) => {
						setConvertedAmount(converted || undefined);
					}}
					showConversion={true}
					error={error && amount <= 0 ? error : undefined}
				/>

				<Input
					label="Description (Optional)"
					placeholder="Add any additional details..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					helperText="Optional: Add notes or details about this item"
				/>

				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						className="flex-1"
					>
						Cancel
					</Button>
					<Button type="button" variant="primary" onClick={handleSave} className="flex-1">
						{existingItem ? 'Update' : 'Add'} {type === 'asset' ? 'Asset' : 'Liability'}
					</Button>
				</div>
			</div>
		</BottomSheet>
	);
}
