import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { donationService } from '../../../services/donationService';
import { alert } from '../../../store/alertStore';
import Avatar from '../../../components/ui/Avatar';
import BottomSheet from '../../../components/ui/BottomSheet';
import {
	ArrowLeftIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	EyeIcon,
	ChartBarIcon,
	DocumentTextIcon,
	CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
	CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import type { Donation, DonationRecipientDetail } from '../../../types/donation.types';

// Mock data for UI development
const mockDonations: Donation[] = [
	{
		id: '1',
		userId: 'user1',
		recipients: [
			{ recipientId: '1', recipientName: 'Ahmad Musa', amount: 2500 },
			{ recipientId: '2', recipientName: 'Fatima Bello', amount: 2500 },
			{ recipientId: '3', recipientName: 'Aminu Sani', amount: 2500 },
			{ recipientId: '4', recipientName: 'Hassan Umar', amount: 2500 },
			{ recipientId: '5', recipientName: 'Maryam Adamu', amount: 2500 },
			{ recipientId: '6', recipientName: 'Usman Abubakar', amount: 2500 },
		],
		totalAmount: 15000,
		zaakiyahAmount: 0,
		paymentMethod: 'paystack',
		paymentReference: 'PAY-123456',
		paymentStatus: 'completed',
		distributionMethod: 'equal',
		isAnonymous: false,
		createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
		completedAt: new Date(Date.now() - 86400000).toISOString(),
	},
	{
		id: '2',
		userId: 'user1',
		recipients: [
			{ recipientId: '1', recipientName: 'Ahmad Musa', amount: 5000 },
			{ recipientId: '2', recipientName: 'Fatima Bello', amount: 3000 },
		],
		totalAmount: 8000,
		zaakiyahAmount: 1000,
		paymentMethod: 'paystack',
		paymentReference: 'PAY-123457',
		paymentStatus: 'completed',
		distributionMethod: 'manual',
		isAnonymous: true,
		createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
		completedAt: new Date(Date.now() - 172800000).toISOString(),
	},
];

export default function DonationHistoryPage() {
	useTheme();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [donations, setDonations] = useState<Donation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
	const [selectedRecipient, setSelectedRecipient] = useState<DonationRecipientDetail | null>(null);
	const [showRecipientDetail, setShowRecipientDetail] = useState(false);
	
	// Fetch donation history
	useEffect(() => {
		fetchDonationHistory();
	}, []);
	
	const fetchDonationHistory = async () => {
		try {
			setIsLoading(true);
			const response = await donationService.getDonationHistory({ page: 1, limit: 50 });
			if (response.data) {
				setDonations(response.data.data);
			}
		} catch (error: any) {
			alert.error(error.response?.data?.message || 'Failed to fetch donation history');
			// Fallback to mock data for development
			setDonations(mockDonations);
		} finally {
			setIsLoading(false);
		}
	};
	
	const filteredDonations = useMemo(() => {
		if (!searchQuery.trim()) return donations;
		
		const query = searchQuery.toLowerCase();
		return donations.filter(donation =>
			donation.recipients.some(r => r.recipientName.toLowerCase().includes(query)) ||
			donation.paymentReference.toLowerCase().includes(query)
		);
	}, [searchQuery, donations]);
	
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-NG', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};
	
	const handleViewRecipient = async (donation: Donation, recipientId: string) => {
		// Mock: In real implementation, fetch recipient details from API
		const recipient = donation.recipients.find(r => r.recipientId === recipientId);
		if (!recipient) return;
		
		// Mock recipient detail - will be replaced with API call
		const recipientDetail: DonationRecipientDetail = {
			applicationId: recipientId,
			recipientName: recipient.recipientName,
			recipientLocation: 'Abuja, Nigeria', // From application
			applicationType: 'individual',
			requestedAmount: 50000,
			approvedAmount: 50000,
			disbursedAmount: 0,
			totalDonations: 2500,
			shortfall: 47500,
			donationAmount: recipient.amount,
			progress: 5, // (totalDonations / requestedAmount) * 100
			status: 'approved',
			updates: [
				{
					id: '1',
					applicationId: recipientId,
					title: 'Thank you for your support',
					description: 'I am grateful for the donation. It will help me complete my education.',
					createdAt: new Date(Date.now() - 86400000).toISOString(),
					createdBy: recipientId,
				},
			],
		};
		
		setSelectedDonation(donation);
		setSelectedRecipient(recipientDetail);
		setShowRecipientDetail(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between mb-3">
						<button
							onClick={() => navigate(-1)}
							className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
						>
							<ArrowLeftIcon className="w-6 h-6 text-slate-900 dark:text-slate-100" />
						</button>
						<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							Donation History
						</h1>
						<div className="w-10" /> {/* Spacer */}
					</div>
					
					{/* Search Bar */}
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
						<input
							type="text"
							placeholder="Search donations..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
						/>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4">
				{isLoading ? (
					<div className="text-center py-12">
						<div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
						<p className="text-slate-500 dark:text-slate-400">Loading donations...</p>
					</div>
				) : filteredDonations.length === 0 ? (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 mb-3">
							<FunnelIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
						</div>
						<p className="text-slate-500 dark:text-slate-400 font-medium mb-1">
							No donations found
						</p>
						<p className="text-sm text-slate-400 dark:text-slate-500">
							{searchQuery ? 'Try adjusting your search' : 'Your donation history will appear here'}
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredDonations.map((donation) => (
							<div
								key={donation.id}
								className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 shadow-sm"
							>
								{/* Header */}
								<div className="flex items-center justify-between mb-3">
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
											{formatDate(donation.createdAt)}
										</p>
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
											{donation.recipients.length} {donation.recipients.length === 1 ? 'Recipient' : 'Recipients'}
										</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold text-primary-600 dark:text-primary-400">
											₦{donation.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{donation.paymentStatus === 'completed' ? 'Completed' : donation.paymentStatus}
										</p>
									</div>
								</div>
								
								{/* Recipients List */}
								<div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
									{donation.recipients.map((recipient) => (
										<button
											key={recipient.recipientId}
											onClick={() => handleViewRecipient(donation, recipient.recipientId)}
											className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
										>
											<div className="flex items-center gap-2 flex-1 min-w-0">
												<span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
													{recipient.recipientName}
												</span>
												<EyeIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
											</div>
											<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
												₦{recipient.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
											</span>
										</button>
									))}
									{donation.zaakiyahAmount > 0 && (
										<div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
											<span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
												Support Zaakiyah
											</span>
											<span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
												₦{donation.zaakiyahAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
											</span>
										</div>
									)}
								</div>
								
								{/* Metadata */}
								<div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
									<span className="text-xs text-slate-500 dark:text-slate-400">
										{donation.distributionMethod === 'equal' ? 'Equal' : 'Manual'} distribution
									</span>
									{donation.isAnonymous && (
										<span className="text-xs text-slate-500 dark:text-slate-400">
											• Anonymous
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</main>
			
			{/* Recipient Detail Modal */}
			{showRecipientDetail && selectedRecipient && (
				<BottomSheet
					isOpen={showRecipientDetail}
					onClose={() => {
						setShowRecipientDetail(false);
						setSelectedRecipient(null);
						setSelectedDonation(null);
					}}
					title={selectedRecipient.recipientName}
				>
					<div className="space-y-4">
						{/* Progress Bar */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
									Funding Progress
								</span>
								<span className="text-sm font-bold text-primary-600 dark:text-primary-400">
									{selectedRecipient.progress}%
								</span>
							</div>
							<div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
									style={{ width: `${selectedRecipient.progress}%` }}
								/>
							</div>
							<div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
								<span>₦{selectedRecipient.totalDonations.toLocaleString('en-NG')} raised</span>
								<span>₦{selectedRecipient.shortfall.toLocaleString('en-NG')} remaining</span>
							</div>
						</div>
						
						{/* Donation Details */}
						<div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
							<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
								Your Donation
							</h3>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 dark:text-slate-400">
										Amount
									</span>
									<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
										₦{selectedRecipient.donationAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 dark:text-slate-400">
										Date
									</span>
									<span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
										{selectedDonation && formatDate(selectedDonation.createdAt)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600 dark:text-slate-400">
										Status
									</span>
									<span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
										<CheckCircleIconSolid className="w-4 h-4" />
										Completed
									</span>
								</div>
							</div>
						</div>
						
						{/* Application Status */}
						<div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl p-4 border-2 border-primary-200/60 dark:border-primary-800/60">
							<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
								Application Status
							</h3>
							<div className="flex items-center gap-2">
								<ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
								<span className="text-sm font-semibold text-primary-700 dark:text-primary-300 capitalize">
									{selectedRecipient.status}
								</span>
							</div>
						</div>
						
						{/* Updates from Applicant */}
						{selectedRecipient.updates && selectedRecipient.updates.length > 0 && (
							<div>
								<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
									Updates from {selectedRecipient.recipientName}
								</h3>
								<div className="space-y-3">
									{selectedRecipient.updates.map((update) => (
										<div
											key={update.id}
											className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4"
										>
											<div className="flex items-start gap-3">
												<div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
													<DocumentTextIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
														{update.title}
													</h4>
													<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
														{update.description}
													</p>
													<p className="text-xs text-slate-500 dark:text-slate-500">
														{formatDate(update.createdAt)}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
						
						{/* View Full Application */}
						<button
							onClick={() => {
								setShowRecipientDetail(false);
								navigate(`/zakaat/donation/recipients/${selectedRecipient.applicationId}`);
							}}
							className="w-full py-3 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/30"
						>
							View Full Application
						</button>
					</div>
				</BottomSheet>
			)}
		</div>
	);
}

