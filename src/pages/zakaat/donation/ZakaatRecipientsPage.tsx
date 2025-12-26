import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useDonationStore } from '../../../store/donationStore';
import { donationService } from '../../../services/donationService';
import { alert } from '../../../store/alertStore';
import RecipientCard from '../../../components/zakaat/donation/RecipientCard';
import {
	MagnifyingGlassIcon,
	HeartIcon,
	ShoppingBagIcon,
	ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Recipient } from '../../../types/donation.types';

// Mock data for UI development
const mockRecipients: Recipient[] = [
	{
		id: '1',
		userId: 'user1',
		applicationId: 'app1',
		name: 'Ahmad Musa',
		firstName: 'Ahmad',
		lastName: 'Musa',
		location: 'Abuja, Nigeria',
		applicationType: 'individual',
		status: 'ready',
		requestedAmount: 50000,
		approvedAmount: 50000,
		disbursedAmount: 0,
		totalDonations: 2500,
		shortfall: 47500, // requestedAmount - disbursedAmount - totalDonations
		whyTheyNeedHelp: 'Ahmad is a student in need of financial assistance to complete his education. He has been accepted into a university program but lacks the funds for tuition and living expenses.',
		supportingDocuments: [
			{ id: '1', name: 'Admission Letter', type: 'pdf', url: '/documents/admission.pdf' },
			{ id: '2', name: 'School ID Card', type: 'image', url: '/documents/id.jpg' },
		],
		campaignImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
		category: 'education',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		userId: 'user2',
		applicationId: 'app2',
		name: 'Fatima Bello',
		firstName: 'Fatima',
		lastName: 'Bello',
		location: 'Lagos, Nigeria',
		applicationType: 'individual',
		status: 'ready',
		requestedAmount: 75000,
		approvedAmount: 75000,
		disbursedAmount: 0,
		totalDonations: 5000,
		shortfall: 70000,
		whyTheyNeedHelp: 'Fatima requires medical assistance for her ongoing treatment. She has been diagnosed with a condition that requires regular medication and medical check-ups.',
		supportingDocuments: [
			{ id: '3', name: 'Medical Report', type: 'pdf', url: '/documents/medical.pdf' },
			{ id: '4', name: 'Utility Bill', type: 'image', url: '/documents/bill.jpg' },
		],
		campaignImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
		category: 'medical',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '3',
		userId: 'user3',
		applicationId: 'app3',
		name: 'Aminu Sani',
		firstName: 'Aminu',
		lastName: 'Sani',
		location: 'Kano, Nigeria',
		applicationType: 'individual',
		status: 'ready',
		requestedAmount: 100000,
		approvedAmount: 100000,
		disbursedAmount: 0,
		totalDonations: 10000,
		shortfall: 90000,
		whyTheyNeedHelp: 'Aminu is starting a small business to support his family. He needs capital to purchase equipment and initial inventory for his shop.',
		supportingDocuments: [
			{ id: '5', name: 'Business Plan', type: 'pdf', url: '/documents/business.pdf' },
		],
		category: 'business',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '4',
		userId: 'user4',
		applicationId: 'app4',
		name: 'Hassan Umar',
		firstName: 'Hassan',
		lastName: 'Umar',
		location: 'Kaduna, Nigeria',
		applicationType: 'individual',
		status: 'ready',
		requestedAmount: 30000,
		approvedAmount: 30000,
		disbursedAmount: 0,
		totalDonations: 15000,
		shortfall: 15000,
		whyTheyNeedHelp: 'Hassan needs assistance with housing expenses. He is currently unable to afford rent and is at risk of eviction.',
		supportingDocuments: [
			{ id: '6', name: 'Rent Agreement', type: 'pdf', url: '/documents/rent.pdf' },
		],
		category: 'education', // Could be housing, but using education for demo
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '5',
		userId: 'user5',
		applicationId: 'app5',
		name: 'Maryam Adamu',
		firstName: 'Maryam',
		lastName: 'Adamu',
		location: 'Port Harcourt, Nigeria',
		applicationType: 'individual',
		status: 'ready',
		requestedAmount: 60000,
		approvedAmount: 60000,
		disbursedAmount: 0,
		totalDonations: 20000,
		shortfall: 40000,
		whyTheyNeedHelp: 'Maryam is a single mother struggling to provide for her children. She needs support for basic necessities and children\'s education.',
		supportingDocuments: [
			{ id: '7', name: 'Birth Certificates', type: 'pdf', url: '/documents/birth.pdf' },
		],
		category: 'education',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '6',
		userId: 'user6',
		applicationId: 'app6',
		name: 'Usman Abubakar',
		firstName: 'Usman',
		lastName: 'Abubakar',
		location: 'Ibadan, Nigeria',
		applicationType: 'individual',
		status: 'ready',
		requestedAmount: 40000,
		approvedAmount: 40000,
		disbursedAmount: 0,
		totalDonations: 35000,
		shortfall: 5000,
		whyTheyNeedHelp: 'Usman requires assistance with debt repayment. He has accumulated debts due to medical expenses and needs help to clear them.',
		supportingDocuments: [
			{ id: '8', name: 'Debt Statement', type: 'pdf', url: '/documents/debt.pdf' },
		],
		category: 'medical',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export default function ZakaatRecipientsPage() {
	useTheme();
	const navigate = useNavigate();
	const { basket, watchlist } = useDonationStore();
	
	const [searchQuery, setSearchQuery] = useState('');
	const [showWatchlist, setShowWatchlist] = useState(false);
	const [filterCategory, setFilterCategory] = useState<string | null>(null);
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [, setIsLoading] = useState(true);
	const [page] = useState(1);
	
	// Fetch recipients from API
	useEffect(() => {
		if (!showWatchlist) {
			fetchRecipients();
		}
	}, [showWatchlist, page]);
	
	const fetchRecipients = async () => {
		try {
			setIsLoading(true);
			const response = await donationService.getRecipients({ page, limit: 20 });
			if (response.data) {
				if (page === 1) {
					setRecipients(response.data.data);
				} else {
					setRecipients(prev => [...prev, ...response.data.data]);
				}
			}
		} catch (error: any) {
			alert.error(error.response?.data?.message || 'Failed to fetch recipients');
			// Fallback to mock data for development
			setRecipients(mockRecipients.filter(r => r.status === 'ready'));
		} finally {
			setIsLoading(false);
		}
	};
	
	// Filter recipients
	const filteredRecipients = useMemo(() => {
		let filtered = showWatchlist 
			? watchlist.map(item => item.recipient)
			: recipients;
		
		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(r =>
				r.name.toLowerCase().includes(query) ||
				r.location.toLowerCase().includes(query) ||
				r.whyTheyNeedHelp?.toLowerCase().includes(query)
			);
		}
		
		// Category filter (if implemented)
		if (filterCategory) {
			filtered = filtered.filter(r => r.category === filterCategory);
		}
		
		return filtered;
	}, [searchQuery, showWatchlist, filterCategory, watchlist, recipients]);
	
	const basketItemCount = basket.items.length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between mb-3">
						<button
							onClick={() => navigate(-1)}
							className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							aria-label="Go back"
						>
							<ArrowLeftIcon className="w-6 h-6 text-slate-900 dark:text-slate-100" />
						</button>
						<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							Zakaat Recipients
						</h1>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setShowWatchlist(!showWatchlist)}
								className={`p-2 rounded-xl transition-all ${
									showWatchlist
										? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
										: 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
								}`}
								aria-label="Watchlist"
							>
								{showWatchlist ? (
									<HeartIconSolid className="w-5 h-5" />
								) : (
									<HeartIcon className="w-5 h-5" />
								)}
							</button>
							{basketItemCount > 0 && (
								<button
									onClick={() => navigate('/zakaat/donation/basket')}
									className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all"
									aria-label="Donation Basket"
								>
									<ShoppingBagIcon className="w-5 h-5" />
									{basketItemCount > 0 && (
										<span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
											{basketItemCount}
										</span>
									)}
								</button>
							)}
						</div>
					</div>
					
					{/* Search Bar */}
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
						<input
							type="text"
							placeholder="Search recipients..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
						/>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="px-4 py-4 pb-24">
				{/* Filter Tabs */}
				<div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
					<button
						onClick={() => setFilterCategory(null)}
						className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
							filterCategory === null
								? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-sm shadow-primary-500/20'
								: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
						}`}
					>
						All
					</button>
					<button
						onClick={() => setFilterCategory('education')}
						className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
							filterCategory === 'education'
								? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-sm shadow-primary-500/20'
								: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
						}`}
					>
						Education
					</button>
					<button
						onClick={() => setFilterCategory('medical')}
						className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
							filterCategory === 'medical'
								? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-sm shadow-primary-500/20'
								: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
						}`}
					>
						Medical
					</button>
					<button
						onClick={() => setFilterCategory('business')}
						className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
							filterCategory === 'business'
								? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-sm shadow-primary-500/20'
								: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
						}`}
					>
						Business
					</button>
				</div>

				{/* Recipients List */}
				{filteredRecipients.length === 0 ? (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 mb-3">
							<HeartIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
						</div>
						<p className="text-slate-500 dark:text-slate-400 font-medium mb-1">
							{showWatchlist ? 'No recipients in watchlist' : 'No recipients found'}
						</p>
						<p className="text-sm text-slate-400 dark:text-slate-500">
							{showWatchlist
								? 'Add recipients to your watchlist to save them for later'
								: 'Try adjusting your search or filters'}
						</p>
					</div>
				) : (
					<>
						{filteredRecipients.map((recipient) => (
							<RecipientCard
								key={recipient.id}
								recipient={recipient}
							/>
						))}
					</>
				)}
			</main>

			{/* Continue Button (if basket has items) */}
			{basketItemCount > 0 && (
				<div className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg z-40"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
				>
					<button
						onClick={() => navigate('/zakaat/donation/basket')}
						className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-500/30 mb-3"
					>
						Continue ({basketItemCount} {basketItemCount === 1 ? 'recipient' : 'recipients'})
					</button>
				</div>
			)}
		</div>
	);
}

