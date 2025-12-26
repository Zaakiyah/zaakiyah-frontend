import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useDonationStore } from '../../../store/donationStore';
import { donationService } from '../../../services/donationService';
import { alert } from '../../../store/alertStore';
import PaymentMethodModal from '../../../components/zakaat/donation/PaymentMethodModal';
import DonationSummary from '../../../components/zakaat/donation/DonationSummary';
import {
	ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function PaymentPage() {
	useTheme();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { basket, getBasketTotal, clearBasket } = useDonationStore();
	
	const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [donationId, setDonationId] = useState<string | null>(null);
	
	const totalAmount = getBasketTotal();
	
	// Check for Paystack callback
	useEffect(() => {
		const reference = searchParams.get('reference');
		const donationIdParam = searchParams.get('donation_id');
		
		if (reference && donationIdParam) {
			handlePaymentCallback(donationIdParam, reference);
		} else if (basket.items.length === 0) {
			// No items in basket, redirect to recipients
			navigate('/zakaat/donation/recipients');
		} else {
			// Show payment method selection
			setShowPaymentMethodModal(true);
		}
	}, [searchParams]);
	
	const handlePaymentMethodSelect = async (method: { id: string; type: string }) => {
		if (method.type !== 'paystack') {
			alert.error('Only Paystack payment is currently supported');
			return;
		}
		
		setSelectedPaymentMethod(method.type);
		setIsProcessing(true);
		
		try {
			const response = await donationService.initiatePayment({
				basket,
				paymentMethod: method.type,
			});
			
			if (response.data) {
				setDonationId(response.data.donationId);
				// Redirect to Paystack checkout
				window.location.href = response.data.paymentLink;
			}
		} catch (error: any) {
			setIsProcessing(false);
			alert.error(error.response?.data?.message || 'Failed to initialize payment');
		}
	};
	
	const handlePaymentCallback = async (donationId: string, reference: string) => {
		setIsProcessing(true);
		
		try {
			const response = await donationService.verifyPayment(donationId, reference);
			
			if (response.data) {
				if (response.data.status === 'completed') {
					// Clear basket and navigate to success
					clearBasket();
					navigate('/zakaat/donation/success', {
						state: {
							recipientCount: basket.items.length,
							totalAmount: totalAmount,
						},
						replace: true,
					});
				} else {
					alert.error('Payment verification failed');
					setIsProcessing(false);
				}
			}
		} catch (error: any) {
			setIsProcessing(false);
			alert.error(error.response?.data?.message || 'Failed to verify payment');
		}
	};

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
				{/* Header */}
				<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
					<div className="px-4 py-3">
						<div className="flex items-center justify-between">
							<button
								onClick={() => navigate('/zakaat/donation/allocate')}
								className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							>
								<ArrowLeftIcon className="w-6 h-6 text-slate-900 dark:text-slate-100" />
							</button>
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Payment
							</h1>
							<div className="w-10" /> {/* Spacer */}
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="px-4 py-4">
					{/* Donation Summary */}
					<DonationSummary basket={basket} totalAmount={totalAmount} />

					{/* Payment Method Selection */}
					{selectedPaymentMethod && (
						<div className="mt-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 shadow-lg">
							<h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
								Payment Method
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								{selectedPaymentMethod === 'paystack' ? 'Pay with Card' : 'Zakaat App Wallet'}
							</p>
						</div>
					)}

					{/* Processing State */}
					{isProcessing && (
						<div className="mt-4 text-center py-8">
							<div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
							<p className="text-slate-600 dark:text-slate-400">
								Processing payment...
							</p>
						</div>
					)}
				</main>

				{/* Proceed Button */}
				{!selectedPaymentMethod && !isProcessing && basket.items.length > 0 && (
					<div className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg z-40"
						style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
					>
						<button
							onClick={() => setShowPaymentMethodModal(true)}
							className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/30 mb-3"
						>
							Choose Payment Method
						</button>
					</div>
				)}
			</div>

			{/* Payment Method Modal */}
			<PaymentMethodModal
				isOpen={showPaymentMethodModal}
				onClose={() => {
					if (!isProcessing) {
						setShowPaymentMethodModal(false);
					}
				}}
				onSelect={handlePaymentMethodSelect}
			/>
		</>
	);
}

