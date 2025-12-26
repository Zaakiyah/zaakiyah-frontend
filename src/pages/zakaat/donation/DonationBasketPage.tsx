import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useDonationStore } from '../../../store/donationStore';
import BasketItem from '../../../components/zakaat/donation/BasketItem';
import DistributionModal from '../../../components/zakaat/donation/DistributionModal';
import {
	ArrowLeftIcon,
	TrashIcon,
	ShoppingBagIcon,
} from '@heroicons/react/24/outline';

export default function DonationBasketPage() {
	useTheme();
	const navigate = useNavigate();
	const { basket, clearBasket, getBasketTotal, distributeEqually, setDistributionMethod } = useDonationStore();
	
	const [showDistributionModal, setShowDistributionModal] = useState(false);
	const totalAmount = getBasketTotal();
	const hasItems = basket.items.length > 0;

	const handleContinue = () => {
		if (!hasItems) return;
		// Show distribution method modal
		setShowDistributionModal(true);
	};
	
	const handleSelectEqual = () => {
		// Distribute equally based on total amount
		distributeEqually(totalAmount);
		navigate('/zakaat/donation/allocate');
	};
	
	const handleSelectManual = () => {
		setDistributionMethod('manual');
		navigate('/zakaat/donation/allocate');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate('/zakaat/donation/recipients')}
							className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
						>
							<ArrowLeftIcon className="w-6 h-6 text-slate-900 dark:text-slate-100" />
						</button>
						<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							Donation Basket
						</h1>
						{hasItems && (
							<button
								onClick={clearBasket}
								className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-red-500"
								aria-label="Clear basket"
							>
								<TrashIcon className="w-6 h-6" />
							</button>
						)}
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4">
				{!hasItems ? (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 mb-3">
							<ShoppingBagIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
						</div>
						<p className="text-slate-500 dark:text-slate-400 font-medium mb-1">
							Your basket is empty
						</p>
						<p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
							Add recipients to your basket to continue
						</p>
						<button
							onClick={() => navigate('/zakaat/donation/recipients')}
							className="px-6 py-2.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-sm shadow-primary-500/20"
						>
							Browse Recipients
						</button>
					</div>
				) : (
					<>
						{/* Basket Items */}
						<div className="space-y-3 mb-4">
							{basket.items.map((item) => (
								<BasketItem key={item.recipientId} item={item} />
							))}
						</div>

						{/* Summary */}
						<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 shadow-lg mb-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-slate-600 dark:text-slate-400">
									Total Recipients
								</span>
								<span className="text-base font-semibold text-slate-900 dark:text-slate-100">
									{basket.items.length}
								</span>
							</div>
							{basket.zaakiyahAmount > 0 && (
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-slate-600 dark:text-slate-400">
										Support Zaakiyah
									</span>
									<span className="text-base font-semibold text-slate-900 dark:text-slate-100">
										₦{basket.zaakiyahAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</span>
								</div>
							)}
							<div className="border-t-2 border-slate-200 dark:border-slate-700 pt-3 mt-3">
								<div className="flex items-center justify-between">
									<span className="text-base font-bold text-slate-900 dark:text-slate-100">
										Total Donation
									</span>
									<span className="text-xl font-bold text-primary-600 dark:text-primary-400">
										₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</span>
								</div>
							</div>
						</div>
					</>
				)}
			</main>

			{/* Continue Button */}
			{hasItems && (
				<div className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg z-40"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
				>
					<button
						onClick={handleContinue}
						className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/30 mb-3"
					>
						Continue
					</button>
				</div>
			)}
			
			{/* Distribution Modal */}
			<DistributionModal
				isOpen={showDistributionModal}
				onClose={() => setShowDistributionModal(false)}
				onSelectEqual={handleSelectEqual}
				onSelectManual={handleSelectManual}
			/>
		</div>
	);
}

