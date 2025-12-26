import BottomSheet from '../../ui/BottomSheet';
import type { DonationBasket } from '../../../types/donation.types';

interface DonationSummaryProps {
	basket: DonationBasket;
	totalAmount: number;
	isOpen?: boolean;
	onClose?: () => void;
	onProceed?: () => void;
}

export default function DonationSummary({
	basket,
	totalAmount,
	isOpen,
	onClose,
	onProceed,
}: DonationSummaryProps) {
	const content = (
		<div className="space-y-4">
			{/* Recipients Breakdown */}
			<div className="space-y-2">
				<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Recipients
				</h3>
				{basket.items.map((item) => (
					<div
						key={item.recipientId}
						className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
					>
						<span className="text-sm text-slate-700 dark:text-slate-300">
							{item.recipient.name}
						</span>
						<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</span>
					</div>
				))}
			</div>

			{/* Support Zaakiyah */}
			{basket.zaakiyahAmount > 0 && (
				<div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
					<span className="text-sm text-slate-700 dark:text-slate-300">
						Support Zaakiyah
					</span>
					<span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
						₦{basket.zaakiyahAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</span>
				</div>
			)}

			{/* Total */}
			<div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4">
				<div className="flex items-center justify-between">
					<span className="text-base font-bold text-slate-900 dark:text-slate-100">
						Total Donation
					</span>
					<span className="text-xl font-bold text-primary-600 dark:text-primary-400">
						₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</span>
				</div>
			</div>

			{/* Distribution Method */}
			<div className="pt-2">
				<p className="text-xs text-slate-500 dark:text-slate-400">
					Distribution: {basket.distributionMethod === 'equal' ? 'Equal' : 'Manual'}
					{basket.isAnonymous && ' • Anonymous'}
				</p>
			</div>
		</div>
	);

	if (isOpen && onClose) {
		return (
			<BottomSheet isOpen={isOpen} onClose={onClose} title="Donation Summary">
				<div className="space-y-4">
					{content}
					{onProceed && (
						<button
							onClick={onProceed}
							className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/30 mt-4"
						>
							Proceed to Payment
						</button>
					)}
				</div>
			</BottomSheet>
		);
	}

	return (
		<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 shadow-lg">
			<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
				Donation Summary
			</h3>
			{content}
		</div>
	);
}



