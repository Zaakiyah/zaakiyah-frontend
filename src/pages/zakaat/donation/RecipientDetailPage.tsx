import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useDonationStore } from '../../../store/donationStore';
import Avatar from '../../../components/ui/Avatar';
import { ArrowLeftIcon, HeartIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Recipient, Document } from '../../../types/donation.types';
import DocumentViewer from '../../../components/zakaat/donation/DocumentViewer';

// Mock data - will be replaced with API call
const getMockRecipient = (id: string): Recipient | null => {
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
			shortfall: 47500,
			whyTheyNeedHelp:
				'Ahmad is a student in need of financial assistance to complete his education. He has been accepted into a university program but lacks the funds for tuition and living expenses. His family has been struggling financially, and without this support, he may not be able to pursue his educational goals.',
			supportingDocuments: [
				{ id: '1', name: 'Admission Letter', type: 'pdf', url: '/documents/admission.pdf' },
				{ id: '2', name: 'School ID Card', type: 'image', url: '/documents/id.jpg' },
				{ id: '3', name: 'Medical Report', type: 'pdf', url: '/documents/medical.pdf' },
				{ id: '4', name: 'Utility Bill', type: 'image', url: '/documents/bill.jpg' },
			],
			campaignImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
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
			whyTheyNeedHelp:
				'Fatima requires medical assistance for her ongoing treatment. She has been diagnosed with a condition that requires regular medication and medical check-ups. The cost of treatment has become a significant burden on her family.',
			supportingDocuments: [
				{ id: '3', name: 'Medical Report', type: 'pdf', url: '/documents/medical.pdf' },
				{ id: '4', name: 'Utility Bill', type: 'image', url: '/documents/bill.jpg' },
			],
			campaignImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	];

	return mockRecipients.find((r) => r.id === id) || null;
};

export default function RecipientDetailPage() {
	useTheme();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { addToBasket, addToWatchlist, removeFromWatchlist, isInWatchlist, basket } =
		useDonationStore();

	const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
	const [showDocumentViewer, setShowDocumentViewer] = useState(false);

	// Mock data - will be replaced with API call
	const recipient = id ? getMockRecipient(id) : null;

	if (!recipient) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
				<div className="text-center">
					<p className="text-slate-500 dark:text-slate-400">Recipient not found</p>
					<button
						onClick={() => navigate('/zakaat/donation/recipients')}
						className="mt-4 px-4 py-2 text-primary-600 dark:text-primary-400 font-semibold"
					>
						Back to Recipients
					</button>
				</div>
			</div>
		);
	}

	const isInBasket = basket.items.some((item) => item.recipientId === recipient.id);
	const isWatched = isInWatchlist(recipient.id);

	const handleWatchlistToggle = () => {
		if (isWatched) {
			removeFromWatchlist(recipient.id);
		} else {
			addToWatchlist(recipient);
		}
	};

	const handleAddToBasket = () => {
		addToBasket(recipient);
	};

	const handleViewDocument = (document: Document) => {
		setSelectedDocument(document);
		setShowDocumentViewer(true);
	};

	return (
		<>
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
								{recipient.name}
							</h1>
							<button
								onClick={handleWatchlistToggle}
								className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
								aria-label={
									isWatched ? 'Remove from watchlist' : 'Add to watchlist'
								}
							>
								{isWatched ? (
									<HeartIconSolid className="w-6 h-6 text-red-500" />
								) : (
									<HeartIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
								)}
							</button>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="px-4 py-4">
					{/* Profile Section */}
					<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 mb-4 shadow-lg overflow-hidden relative">
						{/* Decorative gradient overlay */}
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />

						<div className="relative z-10">
							<div className="flex items-start gap-4 mb-4">
								<Avatar
									avatarUrl={recipient.avatarUrl}
									firstName={recipient.firstName}
									lastName={recipient.lastName}
									size="lg"
								/>
								<div className="flex-1">
									<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
										{recipient.name}
									</h2>
									<p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
										{recipient.location}
									</p>
									<div className="flex items-center gap-4">
										<div>
											<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
												Requested
											</p>
											<p className="text-lg font-bold text-slate-900 dark:text-slate-100">
												₦
												{recipient.requestedAmount.toLocaleString('en-NG', {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</p>
										</div>
										{recipient.approvedAmount && (
											<div>
												<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
													Approved
												</p>
												<p className="text-lg font-bold text-primary-600 dark:text-primary-400">
													₦
													{recipient.approvedAmount.toLocaleString(
														'en-NG',
														{
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														}
													)}
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Campaign Image */}
					{recipient.campaignImageUrl && (
						<div className="rounded-2xl overflow-hidden mb-4 shadow-lg">
							<img
								src={recipient.campaignImageUrl}
								alt={`${recipient.name} campaign`}
								className="w-full h-64 object-cover"
							/>
						</div>
					)}

					{/* Why They Need Help */}
					{recipient.whyTheyNeedHelp && (
						<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 mb-4 shadow-lg">
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
								Why {recipient.firstName} needs help
							</h3>
							<p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
								{recipient.whyTheyNeedHelp}
							</p>
						</div>
					)}

					{/* Supporting Documents */}
					{recipient.supportingDocuments && recipient.supportingDocuments.length > 0 && (
						<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 mb-4 shadow-lg">
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
								Supporting Documents
							</h3>
							<div className="space-y-2">
								{recipient.supportingDocuments.map((doc) => (
									<button
										key={doc.id}
										onClick={() => handleViewDocument(doc)}
										className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-left"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
												<DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
											</div>
											<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
												{doc.name}
											</span>
										</div>
										<EyeIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
									</button>
								))}
							</div>
						</div>
					)}
				</main>

				{/* Fixed Action Button */}
				<div
					className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg z-40"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
				>
					<button
						onClick={handleAddToBasket}
						disabled={isInBasket}
						className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary-500/30 mb-3"
					>
						{isInBasket ? 'Already in Basket' : `Donate to ${recipient.firstName}`}
					</button>
				</div>
			</div>

			{/* Document Viewer Modal */}
			{showDocumentViewer && selectedDocument && (
				<DocumentViewer
					document={selectedDocument}
					isOpen={showDocumentViewer}
					onClose={() => {
						setShowDocumentViewer(false);
						setSelectedDocument(null);
					}}
				/>
			)}
		</>
	);
}
