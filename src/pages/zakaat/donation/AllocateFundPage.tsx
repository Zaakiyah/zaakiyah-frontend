import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useDonationStore } from '../../../store/donationStore';
import AmountInput from '../../../components/zakaat/donation/AmountInput';
import DonationSummary from '../../../components/zakaat/donation/DonationSummary';
import Avatar from '../../../components/ui/Avatar';
import Checkbox from '../../../components/ui/Checkbox';
import {
	ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import type { BasketItem } from '../../../types/donation.types';

export default function AllocateFundPage() {
	useTheme();
	const navigate = useNavigate();
	const { basket, updateBasketItemAmount, setSupportZaakiyah, setIsAnonymous, getBasketTotal } = useDonationStore();
	
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [showAmountInput, setShowAmountInput] = useState(false);
	const [showSummary, setShowSummary] = useState(false);
	const [totalDonation, setTotalDonation] = useState(0);
	
	useEffect(() => {
		// Calculate total from all items
		const total = basket.items.reduce((sum, item) => sum + item.amount, 0);
		setTotalDonation(total);
	}, [basket.items]);
	
	const handleAmountClick = (itemId: string) => {
		setEditingItemId(itemId);
		setShowAmountInput(true);
	};
	
	const handleAmountConfirm = (amount: number) => {
		if (editingItemId) {
			updateBasketItemAmount(editingItemId, amount);
		}
		setShowAmountInput(false);
		setEditingItemId(null);
	};
	
	const handleConfirm = () => {
		setShowSummary(true);
	};
	
	const handleProceedToPayment = () => {
		// Navigate to payment page
		navigate('/zakaat/donation/payment');
	};
	
	const currentEditingItem = editingItemId 
		? basket.items.find(item => item.recipientId === editingItemId)
		: null;

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
				{/* Header */}
				<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
					<div className="px-4 py-3">
						<div className="flex items-center justify-between">
							<button
								onClick={() => navigate('/zakaat/donation/basket')}
								className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							>
								<ArrowLeftIcon className="w-6 h-6 text-slate-900 dark:text-slate-100" />
							</button>
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Allocate Fund
							</h1>
							<div className="w-10" /> {/* Spacer */}
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="px-4 py-4">
					{/* Instructions */}
					<div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl p-4 mb-4 border-2 border-primary-200/60 dark:border-primary-800/60">
						<p className="text-sm text-primary-800 dark:text-primary-200">
							Tap on any amount to edit and allocate funds manually to each recipient.
						</p>
					</div>

					{/* Recipients List */}
					<div className="space-y-3 mb-4">
						{basket.items.map((item) => (
							<RecipientAllocationItem
								key={item.recipientId}
								item={item}
								onAmountClick={() => handleAmountClick(item.recipientId)}
							/>
						))}
					</div>

					{/* Support Zaakiyah */}
					<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 mb-4 shadow-lg">
						<Checkbox
							checked={basket.supportZaakiyah}
							onChange={(checked) => {
								setSupportZaakiyah(checked);
								if (checked && basket.zaakiyahAmount === 0) {
									setSupportZaakiyah(true, 1000); // Default amount
								} else if (!checked) {
									setSupportZaakiyah(false, 0);
								}
							}}
							label={
								<div className="flex-1">
									<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
										Support Zaakiyah
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Help us continue providing this service
									</p>
								</div>
							}
							className="w-full"
						/>
						{basket.supportZaakiyah && (
							<div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
								<button
									onClick={() => handleAmountClick('zaakiyah')}
									className="w-full px-4 py-2.5 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
								>
									₦{basket.zaakiyahAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</button>
							</div>
						)}
					</div>

					{/* Anonymous Donation */}
					<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 mb-4 shadow-lg">
						<Checkbox
							checked={basket.isAnonymous}
							onChange={(checked) => setIsAnonymous(checked)}
							label={
								<div className="flex-1">
									<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
										Anonymous Donation
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Your name will not be shown to recipients
									</p>
								</div>
							}
							className="w-full"
						/>
					</div>

					{/* Donation Summary */}
					<DonationSummary basket={basket} totalAmount={getBasketTotal()} />
				</main>

				{/* Confirm Button */}
				<div className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg z-40"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
				>
					<button
						onClick={handleConfirm}
						disabled={totalDonation === 0}
						className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary-500/30 mb-3"
					>
						Confirm
					</button>
				</div>
			</div>

			{/* Amount Input Modal */}
			{showAmountInput && (
				<AmountInput
					initialAmount={editingItemId === 'zaakiyah' ? basket.zaakiyahAmount : currentEditingItem?.amount || 0}
					isOpen={showAmountInput}
					onClose={() => {
						setShowAmountInput(false);
						setEditingItemId(null);
					}}
					onConfirm={(amount) => {
						if (editingItemId === 'zaakiyah') {
							setSupportZaakiyah(true, amount);
						} else {
							handleAmountConfirm(amount);
						}
					}}
					title={editingItemId === 'zaakiyah' ? 'Support Zaakiyah Amount' : `Amount for ${currentEditingItem?.recipient.name || ''}`}
				/>
			)}

			{/* Summary Modal */}
			{showSummary && (
				<DonationSummary
					basket={basket}
					totalAmount={getBasketTotal()}
					isOpen={showSummary}
					onClose={() => setShowSummary(false)}
					onProceed={handleProceedToPayment}
				/>
			)}
		</>
	);
}

// Helper component for recipient allocation item
interface RecipientAllocationItemProps {
	item: BasketItem;
	onAmountClick: () => void;
}

function RecipientAllocationItem({ item, onAmountClick }: RecipientAllocationItemProps) {
	const { recipient, amount } = item;
	
	return (
		<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<Avatar
					avatarUrl={recipient.avatarUrl}
					firstName={recipient.firstName}
					lastName={recipient.lastName}
					size="md"
				/>
				<div className="flex-1 min-w-0">
					<h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">
						{recipient.name}
					</h3>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						{recipient.location}
					</p>
				</div>
				<button
					onClick={onAmountClick}
					className="px-4 py-2.5 text-base font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors min-w-[120px]"
				>
					₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
				</button>
			</div>
		</div>
	);
}

