import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	PlusIcon,
	CreditCardIcon,
	DocumentTextIcon,
	HomeIcon,
	BanknotesIcon,
	QuestionMarkCircleIcon,
	ExclamationCircleIcon as EmptyIcon,
} from '@heroicons/react/24/outline';
import LiabilityInputField from '../inputs/LiabilityInputField';
import CurrencyInput from '../inputs/CurrencyInput';
import CustomAssetInput from '../inputs/CustomAssetInput';
import BottomSheet from '../../ui/BottomSheet';
import Button from '../../ui/Button';
import EmptyState from '../EmptyState';
import { useWealthCalculationStore } from '../../../store/wealthCalculationStore';
import { useCurrencyStore } from '../../../store/currencyStore';
import { generateId } from '../../../services/wealthCalculationService';
import { formatCurrency } from '../../../utils/currency';
import type { Liability, CustomLiability } from '../../../types/wealth.types';

interface LiabilityInputStepProps {
	onNext: () => void;
	onBack: () => void;
}

export default function LiabilityInputStep({ onNext, onBack }: LiabilityInputStepProps) {
	const { formState, addLiability, removeLiability, updateLiability } =
		useWealthCalculationStore();
	const { preferredCurrency } = useCurrencyStore();
	const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
	const [selectedLiabilityType, setSelectedLiabilityType] = useState<string | null>(null);
	const [customLiabilityOpen, setCustomLiabilityOpen] = useState(false);
	const [editingCustomLiability, setEditingCustomLiability] = useState<CustomLiability | null>(
		null
	);

	const liabilities = formState.liabilities;
	const totalLiabilities = liabilities.reduce(
		(sum, liability) =>
			sum +
			(liability.convertedAmount !== undefined && liability.convertedAmount !== null
				? liability.convertedAmount
				: liability.amount),
		0
	);

	// Sync editingLiability with store state when liability is updated
	useEffect(() => {
		if (editingLiability) {
			const updatedLiability = liabilities.find((l) => l.id === editingLiability.id);
			if (updatedLiability && updatedLiability !== editingLiability) {
				setEditingLiability(updatedLiability);
			}
		}
	}, [liabilities, editingLiability]);

	const liabilityTypes = [
		{ id: 'loan', label: 'Loan', icon: BanknotesIcon, simple: true },
		{ id: 'creditCard', label: 'Credit Card', icon: CreditCardIcon, simple: true },
		{ id: 'bills', label: 'Bills', icon: DocumentTextIcon, simple: true },
		{ id: 'rent', label: 'Rent', icon: HomeIcon, simple: true },
		{ id: 'other', label: 'Other', icon: QuestionMarkCircleIcon, simple: true },
	];

	const handleAddLiability = (type: string) => {
		if (type === 'custom') {
			setCustomLiabilityOpen(true);
		} else {
			const newLiability: Liability = {
				id: generateId(),
				type: type as Liability['type'],
				amount: 0,
				currency: preferredCurrency,
			} as Liability;

			addLiability(newLiability);
			setEditingLiability(newLiability);
			setSelectedLiabilityType(type);
		}
	};

	const handleDeleteLiability = (id: string) => {
		removeLiability(id);
	};

	const handleSaveCustomLiability = (liability: Liability) => {
		if (editingCustomLiability && liability.id === editingCustomLiability.id) {
			updateLiability(liability.id, liability);
		} else {
			addLiability(liability);
		}
		setEditingCustomLiability(null);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
					What are your Liabilities?
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Add all debts and liabilities that should be deducted from your assets. Leave
					empty if you have none.
				</p>
			</div>

			{/* Liabilities List */}
			{liabilities.length === 0 ? (
				<EmptyState
					icon={<EmptyIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />}
					title="No liabilities added"
					description="If you have any outstanding debts, loans, bills, or other liabilities, add them here. This will be deducted from your total assets to calculate your net worth."
				/>
			) : (
				<div className="space-y-3" role="list" aria-label="Liabilities list">
					<AnimatePresence mode="popLayout">
						{liabilities.map((liability) => (
							<motion.div
								key={liability.id}
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95, height: 0 }}
								transition={{ duration: 0.2 }}
								role="listitem"
							>
								<LiabilityInputField
									liability={liability}
									onEdit={() => {
										if (liability.type === 'custom') {
											setEditingCustomLiability(liability as CustomLiability);
											setCustomLiabilityOpen(true);
										} else {
											setEditingLiability(liability);
											setSelectedLiabilityType(liability.type);
										}
									}}
									onDelete={() => handleDeleteLiability(liability.id)}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}

			{/* Add Liability Buttons */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{liabilityTypes.map((liabilityType) => {
					const Icon = liabilityType.icon;
					const existingCount = liabilities.filter(
						(l) => l.type === liabilityType.id
					).length;
					return (
						<button
							key={liabilityType.id}
							onClick={() => handleAddLiability(liabilityType.id)}
							className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 hover:border-primary-300 dark:hover:border-primary-700 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
							aria-label={`Add ${liabilityType.label} liability`}
							type="button"
						>
							<Icon
								className="w-6 h-6 text-slate-600 dark:text-slate-400"
								aria-hidden="true"
							/>
							<span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
								{liabilityType.label}
							</span>
							{existingCount > 0 && (
								<span
									className="text-xs text-primary-600 dark:text-primary-400 font-semibold"
									aria-label={`${existingCount} ${liabilityType.label} liability${
										existingCount > 1 ? 'ies' : ''
									} added`}
								>
									{existingCount}
								</span>
							)}
						</button>
					);
				})}
				<button
					onClick={() => {
						setEditingCustomLiability(null);
						setCustomLiabilityOpen(true);
					}}
					className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-dashed border-slate-300/60 dark:border-slate-600/60 hover:border-primary-300 dark:hover:border-primary-700 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
					aria-label="Add custom liability"
					type="button"
				>
					<PlusIcon
						className="w-6 h-6 text-slate-600 dark:text-slate-400"
						aria-hidden="true"
					/>
					<span className="text-xs font-medium text-slate-700 dark:text-slate-300">
						Custom
					</span>
				</button>
			</div>

			{/* Total Liabilities Display */}
			{liabilities.length > 0 && (
				<div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
							Total Liabilities:
						</span>
						<span className="text-lg font-bold text-error-600 dark:text-error-400">
							{formatCurrency(totalLiabilities, preferredCurrency)}
						</span>
					</div>
				</div>
			)}

			{/* Navigation */}
			<div className="flex gap-3 pt-4">
				<Button variant="outline" onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button variant="primary" onClick={onNext} className="flex-1">
					Continue
				</Button>
			</div>

			{/* Simple Liability Input Sheet */}
			<BottomSheet
				isOpen={
					!!(
						selectedLiabilityType &&
						editingLiability &&
						liabilityTypes.some((t) => t.id === selectedLiabilityType)
					)
				}
				onClose={() => {
					setEditingLiability(null);
					setSelectedLiabilityType(null);
				}}
				title={`${
					liabilities.find((l) => l.id === editingLiability?.id) ? 'Edit' : 'Add'
				} ${
					liabilityTypes.find((t) => t.id === selectedLiabilityType)?.label || 'Liability'
				}`}
			>
				<div className="space-y-4 pb-4">
					{editingLiability &&
						(() => {
							// Get the latest liability from store to ensure currency is synced
							const currentLiability =
								liabilities.find((l) => l.id === editingLiability.id) ||
								editingLiability;
							return (
								<CurrencyInput
									label="Amount"
									value={currentLiability.amount}
									currency={currentLiability.currency}
									onAmountChange={(amount) => {
										updateLiability(editingLiability.id, { amount });
									}}
									onCurrencyChange={(currency) => {
										updateLiability(editingLiability.id, {
											currency,
											// Clear converted amount when currency changes - it will be recalculated
											convertedAmount: undefined,
										});
										// Update local editingLiability state to reflect currency change
										setEditingLiability({ ...editingLiability, currency });
									}}
									onConversionComplete={(converted) => {
										if (converted !== null && converted !== undefined) {
											updateLiability(editingLiability.id, {
												convertedAmount: converted,
											});
										} else if (
											converted === null &&
											currentLiability.currency === preferredCurrency
										) {
											// Clear convertedAmount if currency matches preferred (no conversion needed)
											updateLiability(editingLiability.id, {
												convertedAmount: undefined,
											});
										}
									}}
									showConversion={true}
								/>
							);
						})()}
					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={() => {
								setEditingLiability(null);
								setSelectedLiabilityType(null);
							}}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => {
								setEditingLiability(null);
								setSelectedLiabilityType(null);
							}}
							className="flex-1"
						>
							Save
						</Button>
					</div>
				</div>
			</BottomSheet>

			{/* Custom Liability Input */}
			<CustomAssetInput
				isOpen={customLiabilityOpen}
				onClose={() => {
					setCustomLiabilityOpen(false);
					setEditingCustomLiability(null);
				}}
				onSave={handleSaveCustomLiability}
				type="liability"
				existingItem={editingCustomLiability || undefined}
			/>
		</motion.div>
	);
}
