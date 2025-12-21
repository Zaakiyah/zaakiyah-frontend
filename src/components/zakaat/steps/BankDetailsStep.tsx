import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { alert } from '../../../store/alertStore';
import { logger } from '../../../utils/logger';
import type { BankDetails } from '../../../types/zakaat.types';
import Select from '../../ui/Select';
import { paystackService, type PaystackBank } from '../../../services/paystackService';

interface BankDetailsStepProps {
	initialValue?: BankDetails | null;
	onComplete: (data: { bankDetails: BankDetails }) => void;
	onBack: () => void;
}

export default function BankDetailsStep({
	initialValue,
	onComplete,
	onBack,
}: BankDetailsStepProps) {
	const [banks, setBanks] = useState<PaystackBank[]>([]);
	const [isLoadingBanks, setIsLoadingBanks] = useState(false);
	const [selectedBankCode, setSelectedBankCode] = useState('');
	const [bankName, setBankName] = useState(initialValue?.bankName || '');
	const [accountNumber, setAccountNumber] = useState(initialValue?.accountNumber || '');
	const [accountName, setAccountName] = useState(initialValue?.accountName || '');
	const [isResolving, setIsResolving] = useState(false);

	// Load banks on mount
	useEffect(() => {
		const loadBanks = async () => {
			setIsLoadingBanks(true);
			try {
				const bankList = await paystackService.getBanks();
				setBanks(bankList);
				// If initial value has bank name, try to find matching bank code
				if (initialValue?.bankName) {
					const matchedBank = bankList.find((b) => b.name.toLowerCase() === initialValue?.bankName.toLowerCase());
					if (matchedBank) {
						setSelectedBankCode(matchedBank.code);
					}
				}
			} catch (error: any) {
				logger.error('Error loading banks:', error);
				alert.error('Failed to load banks. Please try again.');
			} finally {
				setIsLoadingBanks(false);
			}
		};
		loadBanks();
	}, []);

	// Resolve account when bank and account number are provided
	useEffect(() => {
		const resolveAccount = async () => {
			if (selectedBankCode && accountNumber && accountNumber.length === 10) {
				setIsResolving(true);
				try {
					const resolved = await paystackService.resolveAccount(selectedBankCode, accountNumber);
					if (resolved) {
						setAccountName(resolved.account_name);
						alert.success('Account name resolved successfully');
					}
				} catch (error: any) {
					logger.error('Error resolving account:', error);
					// Don't show error if account resolution fails - user can enter manually
					if (error.message && !error.message.includes('not configured')) {
						// Only show error if it's a real resolution error, not a config issue
					}
				} finally {
					setIsResolving(false);
				}
			} else if (accountNumber.length > 0 && accountNumber.length !== 10) {
				// Clear account name if account number is invalid length
				setAccountName('');
			}
		};

		// Debounce account resolution
		const timeoutId = setTimeout(() => {
			resolveAccount();
		}, 1000);

		return () => clearTimeout(timeoutId);
	}, [selectedBankCode, accountNumber]);

	const handleBankChange = (bankCode: string) => {
		setSelectedBankCode(bankCode);
		const selectedBank = banks.find((b) => b.code === bankCode);
		if (selectedBank) {
			setBankName(selectedBank.name);
		}
	};

	const handleSubmit = () => {
		if (!bankName || !accountNumber || !accountName) {
			alert.error('Please fill in all required fields');
			return;
		}
		onComplete({
			bankDetails: {
				bankName,
				accountNumber,
				accountName,
			},
		});
	};

	return (
		<div className="space-y-6">
			<Select
				value={selectedBankCode}
				onChange={handleBankChange}
				options={banks.map((bank) => ({ value: bank.code, label: bank.name }))}
				placeholder={isLoadingBanks ? 'Loading banks...' : 'Select bank'}
				label={
					<>
						Bank Name <span className="text-red-500">*</span>
					</>
				}
				disabled={isLoadingBanks}
				searchable={true}
			/>

			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Account Number <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<input
						type="text"
						value={accountNumber}
						onChange={(e) => {
							// Only allow numbers
							const value = e.target.value.replace(/\D/g, '');
							setAccountNumber(value);
						}}
						placeholder="Enter 10-digit account number"
						maxLength={10}
						className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400"
					/>
					{isResolving && (
						<div className="absolute right-4 top-1/2 -translate-y-1/2">
							<div className="w-5 h-5 border-2 border-primary-500/30 dark:border-primary-400/30 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin shadow-sm" />
						</div>
					)}
				</div>
				{accountNumber.length === 10 && selectedBankCode && !isResolving && !accountName && (
					<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						Account name will be resolved automatically
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Account Name <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={accountName}
					onChange={(e) => setAccountName(e.target.value)}
					placeholder="Account name will be resolved automatically"
					readOnly={!!(selectedBankCode && accountNumber.length === 10)}
					className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 ${
						selectedBankCode && accountNumber.length === 10
							? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed'
							: ''
					}`}
				/>
			</div>

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				<button
					onClick={onBack}
					className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Back
				</button>
				<button
					onClick={handleSubmit}
					disabled={!selectedBankCode || !accountNumber || !accountName || isResolving}
					className="flex-1 px-4 py-3 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
				>
					Continue
				</button>
			</div>
		</div>
	);
}

