import React from 'react';
import BottomSheet from '../../ui/BottomSheet';
import {
	CreditCardIcon,
	WalletIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethod {
	id: string;
	name: string;
	type: 'paystack' | 'wallet';
	icon: React.ReactNode;
	isAvailable: boolean;
}

interface PaymentMethodModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (method: PaymentMethod) => void;
}

const paymentMethods: PaymentMethod[] = [
	{
		id: 'paystack',
		name: 'Pay with Card',
		type: 'paystack',
		icon: <CreditCardIcon className="w-6 h-6" />,
		isAvailable: true,
	},
	// Wallet option can be added later
	// {
	// 	id: 'wallet',
	// 	name: 'Zakaat App Wallet',
	// 	type: 'wallet',
	// 	icon: <WalletIcon className="w-6 h-6" />,
	// 	isAvailable: false,
	// },
];

export default function PaymentMethodModal({
	isOpen,
	onClose,
	onSelect,
}: PaymentMethodModalProps) {
	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Choose your payment method">
			<div className="space-y-3">
				{paymentMethods.map((method) => (
					<button
						key={method.id}
						onClick={() => {
							onSelect(method);
							onClose();
						}}
						disabled={!method.isAvailable}
						className="w-full p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left group"
					>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform text-primary-600 dark:text-primary-400">
								{method.icon}
							</div>
							<div className="flex-1">
								<h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
									{method.name}
								</h3>
							</div>
						</div>
					</button>
				))}
			</div>
		</BottomSheet>
	);
}



