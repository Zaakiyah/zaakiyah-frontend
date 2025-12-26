import { useState, useEffect } from 'react';
import BottomSheet from '../../ui/BottomSheet';

interface AmountInputProps {
	initialAmount: number;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (amount: number) => void;
	title?: string;
}

export default function AmountInput({
	initialAmount,
	isOpen,
	onClose,
	onConfirm,
	title = 'Enter Amount',
}: AmountInputProps) {
	const [amount, setAmount] = useState(initialAmount.toString());

	useEffect(() => {
		if (isOpen) {
			setAmount(initialAmount > 0 ? initialAmount.toString() : '');
		}
	}, [isOpen, initialAmount]);

	const handleNumberPress = (num: string) => {
		if (amount === '0' && num !== '.') {
			setAmount(num);
		} else {
			setAmount((prev) => prev + num);
		}
	};

	const handleBackspace = () => {
		setAmount((prev) => prev.slice(0, -1) || '0');
	};

	const handleClear = () => {
		setAmount('0');
	};

	const handleConfirm = () => {
		const numAmount = parseFloat(amount) || 0;
		onConfirm(numAmount);
		onClose();
	};

	const displayAmount = amount === '' ? '0' : amount;
	const numericAmount = parseFloat(displayAmount) || 0;

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
			<div className="flex flex-col">
				{/* Amount Display */}
				<div className="text-center mb-6">
					<p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
						₦
						{numericAmount.toLocaleString('en-NG', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</p>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Enter the donation amount
					</p>
				</div>

				{/* Numeric Keypad */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
						<button
							key={num}
							onClick={() => handleNumberPress(num.toString())}
							className="py-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-900 dark:text-slate-100 hover:border-primary-500 dark:hover:border-primary-400 transition-all active:scale-95"
						>
							{num}
						</button>
					))}
					<button
						onClick={handleClear}
						className="py-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:border-red-500 dark:hover:border-red-400 transition-all active:scale-95"
					>
						Clear
					</button>
					<button
						onClick={() => handleNumberPress('0')}
						className="py-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-900 dark:text-slate-100 hover:border-primary-500 dark:hover:border-primary-400 transition-all active:scale-95"
					>
						0
					</button>
					<button
						onClick={handleBackspace}
						className="py-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 transition-all active:scale-95"
					>
						⌫
					</button>
				</div>

				{/* Decimal Point */}
				<button
					onClick={() => {
						if (!amount.includes('.')) {
							handleNumberPress('.');
						}
					}}
					className="w-full py-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-lg font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 transition-all active:scale-95 mb-4"
				>
					.
				</button>

				{/* Approve Button */}
				<button
					onClick={handleConfirm}
					disabled={numericAmount === 0}
					className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary-500/30"
				>
					Approve
				</button>
			</div>
		</BottomSheet>
	);
}
