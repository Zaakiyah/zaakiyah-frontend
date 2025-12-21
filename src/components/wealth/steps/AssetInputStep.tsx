import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	PlusIcon,
	CurrencyDollarIcon,
	BanknotesIcon,
	ChartBarIcon,
	BriefcaseIcon,
	ScaleIcon,
	HandRaisedIcon,
	SparklesIcon,
	ExclamationTriangleIcon,
	BanknotesIcon as EmptyIcon,
} from '@heroicons/react/24/outline';
import AssetInputField from '../inputs/AssetInputField';
import CurrencyInput from '../inputs/CurrencyInput';
import GoldSilverInput from '../inputs/GoldSilverInput';
import LivestockInput from '../inputs/LivestockInput';
import CustomAssetInput from '../inputs/CustomAssetInput';
import BottomSheet from '../../ui/BottomSheet';
import Button from '../../ui/Button';
import EmptyState from '../EmptyState';
import { useWealthCalculationStore } from '../../../store/wealthCalculationStore';
import { useCurrencyStore } from '../../../store/currencyStore';
import { generateId } from '../../../services/wealthCalculationService';
import { formatCurrency } from '../../../utils/currency';
import { validateCalculationForm } from '../../../utils/wealthValidation';
import type {
	Asset,
	GoldAsset,
	SilverAsset,
	LivestockAsset,
	CustomAsset,
} from '../../../types/wealth.types';

interface AssetInputStepProps {
	onNext: () => void;
	onBack: () => void;
}

export default function AssetInputStep({ onNext, onBack }: AssetInputStepProps) {
	const {
		formState,
		validationErrors,
		addAsset,
		removeAsset,
		updateAsset,
		setValidationErrors,
		setValidationWarnings,
	} = useWealthCalculationStore();
	const { preferredCurrency } = useCurrencyStore();
	const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
	const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
	const [customAssetOpen, setCustomAssetOpen] = useState(false);
	const [editingCustomAsset, setEditingCustomAsset] = useState<CustomAsset | null>(null);

	const assets = formState.assets;
	const totalAssets = assets.reduce(
		(sum, asset) =>
			sum +
			(asset.convertedAmount !== undefined && asset.convertedAmount !== null
				? asset.convertedAmount
				: asset.amount),
		0
	);

	// Sync editingAsset with store state when asset is updated
	useEffect(() => {
		if (editingAsset) {
			const updatedAsset = assets.find((a) => a.id === editingAsset.id);
			if (updatedAsset && updatedAsset !== editingAsset) {
				setEditingAsset(updatedAsset);
			}
		}
	}, [assets, editingAsset]);

	// Validate assets when they change
	useEffect(() => {
		const validation = validateCalculationForm(formState.assets, []);
		setValidationErrors(validation.errors);
		setValidationWarnings(validation.warnings);
	}, [formState.assets, setValidationErrors, setValidationWarnings]);

	const handleNext = () => {
		const validation = validateCalculationForm(formState.assets, []);
		if (!validation.isValid) {
			// Don't proceed if there are blocking errors
			return;
		}
		onNext();
	};

	const assetErrors = validationErrors.filter((e: any) => e.field?.startsWith('asset'));

	const assetTypes = [
		{ id: 'cash', label: 'Cash', icon: BanknotesIcon, simple: true },
		{ id: 'bank', label: 'Bank Savings', icon: CurrencyDollarIcon, simple: true },
		{ id: 'stocks', label: 'Stocks/Investments', icon: ChartBarIcon, simple: true },
		{ id: 'business', label: 'Business Assets', icon: BriefcaseIcon, simple: true },
		{ id: 'gold', label: 'Gold', icon: ScaleIcon, simple: false },
		{ id: 'silver', label: 'Silver', icon: ScaleIcon, simple: false },
		{ id: 'livestock', label: 'Livestock', icon: HandRaisedIcon, simple: false },
		{ id: 'farmProduce', label: 'Farm Produce', icon: SparklesIcon, simple: true },
	];

	const handleAddAsset = (type: string) => {
		if (type === 'gold' || type === 'silver') {
			const newAsset: Asset = {
				id: generateId(),
				type: type as 'gold' | 'silver',
				amount: 0,
				currency: preferredCurrency,
				weight: 0,
				pricePerGram: 0,
			} as GoldAsset | SilverAsset;

			addAsset(newAsset);
			setEditingAsset(newAsset);
			setSelectedAssetType(type);
		} else if (type === 'livestock') {
			const newAsset: Asset = {
				id: generateId(),
				type: 'livestock',
				amount: 0,
				currency: preferredCurrency,
				livestockType: '',
				count: 0,
				valuePerUnit: 0,
			} as LivestockAsset;

			addAsset(newAsset);
			setEditingAsset(newAsset);
			setSelectedAssetType(type);
		} else if (type === 'custom') {
			setCustomAssetOpen(true);
		} else {
			// Simple asset types - open input directly
			const newAsset: Asset = {
				id: generateId(),
				type: type as Asset['type'],
				amount: 0,
				currency: preferredCurrency,
			} as Asset;

			addAsset(newAsset);
			setEditingAsset(newAsset);
			setSelectedAssetType(type);
		}
	};

	const handleSaveCustomAsset = (asset: CustomAsset) => {
		if (editingCustomAsset && asset.id === editingCustomAsset.id) {
			updateAsset(asset.id, asset);
		} else {
			addAsset(asset);
		}
		setEditingCustomAsset(null);
	};

	const handleDeleteAsset = (id: string) => {
		removeAsset(id);
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
					What are your Assets?
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Add all assets you own that are zakaatable. You can add multiple items of each
					type.
				</p>
			</div>

			{/* Assets List */}
			{assets.length === 0 ? (
				<EmptyState
					icon={<EmptyIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />}
					title="No assets added yet"
					description="Start by adding your assets using the buttons below. Include cash, bank savings, investments, gold, silver, and any other zakaatable assets."
				/>
			) : (
				<div className="space-y-3" role="list" aria-label="Assets list">
					<AnimatePresence mode="popLayout">
						{assets.map((asset) => (
							<motion.div
								key={asset.id}
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95, height: 0 }}
								transition={{ duration: 0.2 }}
								role="listitem"
							>
								<AssetInputField
									asset={asset}
									onEdit={() => {
										if (asset.type === 'custom') {
											setEditingCustomAsset(asset as CustomAsset);
											setCustomAssetOpen(true);
										} else {
											setEditingAsset(asset);
											setSelectedAssetType(asset.type);
										}
									}}
									onDelete={() => handleDeleteAsset(asset.id)}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}

			{/* Add Asset Buttons */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{assetTypes.map((assetType) => {
					const Icon = assetType.icon;
					const existingCount = assets.filter((a) => a.type === assetType.id).length;
					return (
						<button
							key={assetType.id}
							onClick={() => handleAddAsset(assetType.id)}
							className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-slate-200/60 dark:border-slate-600/60 hover:border-primary-300 dark:hover:border-primary-700 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
							aria-label={`Add ${assetType.label} asset`}
							type="button"
						>
							<Icon
								className="w-6 h-6 text-slate-600 dark:text-slate-400"
								aria-hidden="true"
							/>
							<span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
								{assetType.label}
							</span>
							{existingCount > 0 && (
								<span
									className="text-xs text-primary-600 dark:text-primary-400 font-semibold"
									aria-label={`${existingCount} ${assetType.label} asset${
										existingCount > 1 ? 's' : ''
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
						setEditingCustomAsset(null);
						setCustomAssetOpen(true);
					}}
					className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border-2 border-dashed border-slate-300/60 dark:border-slate-600/60 hover:border-primary-300 dark:hover:border-primary-700 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
					aria-label="Add custom asset"
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

			{/* Total Assets Display */}
			<div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 shadow-sm">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
						Total Assets:
					</span>
					<span className="text-lg font-bold text-primary-600 dark:text-primary-400">
						{formatCurrency(totalAssets, preferredCurrency)}
					</span>
				</div>
			</div>

			{/* Validation Messages */}
			{formState.assets.length > 0 && (
				<AnimatePresence>
					{assetErrors.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-sm"
						>
							<div className="flex items-start gap-2">
								<ExclamationTriangleIcon className="w-5 h-5 text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
								<div className="flex-1 space-y-1">
									{assetErrors.map((error: any, idx: number) => (
										<p
											key={idx}
											className="text-sm text-error-700 dark:text-error-300"
										>
											{error.message}
										</p>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{/* Navigation */}
			<div className="flex gap-3 pt-4">
				<Button variant="outline" onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button
					variant="primary"
					onClick={handleNext}
					className="flex-1"
					disabled={assets.length === 0 || assetErrors.length > 0}
				>
					Continue
				</Button>
			</div>

			{/* Simple Asset Input Sheet */}
			<BottomSheet
				isOpen={
					!!(
						selectedAssetType &&
						editingAsset &&
						['cash', 'bank', 'stocks', 'business', 'farmProduce'].includes(
							selectedAssetType
						)
					)
				}
				onClose={() => {
					setEditingAsset(null);
					setSelectedAssetType(null);
				}}
				title={`${assets.find((a) => a.id === editingAsset?.id) ? 'Edit' : 'Add'} ${
					assetTypes.find((t) => t.id === selectedAssetType)?.label || 'Asset'
				}`}
			>
				<div className="space-y-4 pb-4">
					{editingAsset &&
						(() => {
							// Get the latest asset from store to ensure currency is synced
							const currentAsset =
								assets.find((a) => a.id === editingAsset.id) || editingAsset;
							return (
								<CurrencyInput
									label="Amount"
									value={currentAsset.amount}
									currency={currentAsset.currency}
									onAmountChange={(amount) => {
										updateAsset(editingAsset.id, {
											amount,
											// Converted amount will be set via onConversionComplete callback
										});
									}}
									onCurrencyChange={(currency) => {
										updateAsset(editingAsset.id, {
											currency,
											// Clear converted amount when currency changes - it will be recalculated
											convertedAmount: undefined,
										});
										// Update local editingAsset state to reflect currency change
										setEditingAsset({ ...editingAsset, currency });
									}}
									onConversionComplete={(converted) => {
										if (converted !== null && converted !== undefined) {
											updateAsset(editingAsset.id, {
												convertedAmount: converted,
											});
										} else if (
											converted === null &&
											currentAsset.currency === preferredCurrency
										) {
											// Clear convertedAmount if currency matches preferred (no conversion needed)
											updateAsset(editingAsset.id, {
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
								setEditingAsset(null);
								setSelectedAssetType(null);
							}}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => {
								setEditingAsset(null);
								setSelectedAssetType(null);
							}}
							className="flex-1"
						>
							Save
						</Button>
					</div>
				</div>
			</BottomSheet>

			{/* Gold/Silver Input Sheet */}
			<BottomSheet
				isOpen={
					!!(
						selectedAssetType &&
						(selectedAssetType === 'gold' || selectedAssetType === 'silver') &&
						editingAsset
					)
				}
				onClose={() => {
					setEditingAsset(null);
					setSelectedAssetType(null);
				}}
				title={`${assets.find((a) => a.id === editingAsset?.id) ? 'Edit' : 'Add'} ${
					selectedAssetType === 'gold' ? 'Gold' : 'Silver'
				}`}
			>
				<div className="space-y-4 pb-4">
					{editingAsset &&
						(editingAsset.type === 'gold' || editingAsset.type === 'silver') && (
							<GoldSilverInput
								type={editingAsset.type}
								weight={(editingAsset as GoldAsset | SilverAsset).weight || 0}
								pricePerGram={
									(editingAsset as GoldAsset | SilverAsset).pricePerGram || 0
								}
								useMarketPrice={
									(editingAsset as GoldAsset | SilverAsset).useMarketPrice ||
									false
								}
								onWeightChange={(weight) => {
									if (editingAsset) {
										const pricePerGram =
											(editingAsset as GoldAsset | SilverAsset)
												.pricePerGram || 0;
										updateAsset(editingAsset.id, {
											weight,
											amount: weight * pricePerGram,
										});
									}
								}}
								onPriceChange={(pricePerGram) => {
									if (editingAsset) {
										const weight =
											(editingAsset as GoldAsset | SilverAsset).weight || 0;
										updateAsset(editingAsset.id, {
											pricePerGram,
											amount: weight * pricePerGram,
										});
									}
								}}
								onUseMarketPrice={(useMarketPrice) => {
									if (editingAsset) {
										updateAsset(editingAsset.id, { useMarketPrice });
									}
								}}
							/>
						)}
					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={() => {
								setEditingAsset(null);
								setSelectedAssetType(null);
							}}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => {
								setEditingAsset(null);
								setSelectedAssetType(null);
							}}
							className="flex-1"
						>
							Save
						</Button>
					</div>
				</div>
			</BottomSheet>

			{/* Livestock Input Sheet */}
			<BottomSheet
				isOpen={!!(selectedAssetType === 'livestock' && editingAsset)}
				onClose={() => {
					setEditingAsset(null);
					setSelectedAssetType(null);
				}}
				title={`${
					assets.find((a) => a.id === editingAsset?.id) ? 'Edit' : 'Add'
				} Livestock`}
			>
				<div className="space-y-4 pb-4">
					{editingAsset && editingAsset.type === 'livestock' && (
						<LivestockInput
							livestockType={(editingAsset as LivestockAsset).livestockType || ''}
							count={(editingAsset as LivestockAsset).count || 0}
							valuePerUnit={(editingAsset as LivestockAsset).valuePerUnit || 0}
							onLivestockTypeChange={(livestockType) => {
								if (editingAsset) {
									const count = (editingAsset as LivestockAsset).count || 0;
									const valuePerUnit =
										(editingAsset as LivestockAsset).valuePerUnit || 0;
									updateAsset(editingAsset.id, {
										livestockType,
										amount: count * valuePerUnit,
									});
								}
							}}
							onCountChange={(count) => {
								if (editingAsset) {
									const valuePerUnit =
										(editingAsset as LivestockAsset).valuePerUnit || 0;
									updateAsset(editingAsset.id, {
										count,
										amount: count * valuePerUnit,
									});
								}
							}}
							onValuePerUnitChange={(valuePerUnit) => {
								if (editingAsset) {
									const count = (editingAsset as LivestockAsset).count || 0;
									updateAsset(editingAsset.id, {
										valuePerUnit,
										amount: count * valuePerUnit,
									});
								}
							}}
						/>
					)}
					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={() => {
								setEditingAsset(null);
								setSelectedAssetType(null);
							}}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => {
								setEditingAsset(null);
								setSelectedAssetType(null);
							}}
							className="flex-1"
						>
							Save
						</Button>
					</div>
				</div>
			</BottomSheet>

			{/* Custom Asset Input */}
			<CustomAssetInput
				isOpen={customAssetOpen}
				onClose={() => {
					setCustomAssetOpen(false);
					setEditingCustomAsset(null);
				}}
				onSave={handleSaveCustomAsset}
				type="asset"
				existingItem={editingCustomAsset || undefined}
			/>
		</motion.div>
	);
}
