import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import {
	CheckCircleIcon,
} from '@heroicons/react/24/solid';

export default function DonationSuccessPage() {
	useTheme();
	const navigate = useNavigate();
	const location = useLocation();
	
	const recipientCount = location.state?.recipientCount || 0;
	const totalAmount = location.state?.totalAmount || 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl border-2 border-slate-200/60 dark:border-slate-700/60 p-8 shadow-2xl text-center">
					{/* Success Icon */}
					<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
						<CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
					</div>
					
					{/* Success Message */}
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
						Successful!
					</h1>
					<p className="text-base text-slate-600 dark:text-slate-400 mb-6">
						You have successfully donated your Zakaat to {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'}.
					</p>
					
					{/* Total Amount */}
					<div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
						<p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
							Total Donation
						</p>
						<p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
							₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</p>
					</div>
					
					{/* Action Buttons */}
					<div className="space-y-3">
						<button
							onClick={() => navigate('/zakaat/donation/history')}
							className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/30"
						>
							See Donation History
						</button>
						<button
							onClick={() => navigate('/zakaat/donation/recipients')}
							className="w-full py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
						>
							Browse More Recipients
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}



