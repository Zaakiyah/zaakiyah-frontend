import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { useDonationStore } from '../../../store/donationStore';
import { useAuthStore } from '../../../store/authStore';
import { donationService } from '../../../services/donationService';
import { alert } from '../../../store/alertStore';
import { logger } from '../../../utils/logger';
import Avatar from '../../../components/ui/Avatar';
import Loader from '../../../components/ui/Loader';
import ProgressTracker from '../../../components/zakaat/donation/ProgressTracker';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import {
	ArrowLeftIcon,
	HeartIcon,
	DocumentTextIcon,
	EyeIcon,
	ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Recipient, Document, ApplicationUpdate } from '../../../types/donation.types';
import DocumentViewer from '../../../components/zakaat/donation/DocumentViewer';

export default function RecipientDetailPage() {
	useTheme();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { user } = useAuthStore();
	const { addToBasket, addToWatchlist, removeFromWatchlist, isInWatchlist, basket } =
		useDonationStore();

	const [recipient, setRecipient] = useState<Recipient | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
	const [showDocumentViewer, setShowDocumentViewer] = useState(false);
	const [updates, setUpdates] = useState<ApplicationUpdate[]>([]);
	const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);

	// Fetch recipient from API
	useEffect(() => {
		if (id) {
			fetchRecipient();
		}
	}, [id]);

	const fetchRecipient = async () => {
		try {
			setIsLoading(true);
			// Fetch all recipients and find the one with matching ID
			const response = await donationService.getRecipients({ page: 1, limit: 100 });
			if (response.data) {
				const found = response.data.items.find((r: Recipient) => r.id === id);
				if (found) {
					// Prevent self-donation
					if (found.userId === user?.id) {
						alert.error('You cannot donate to yourself');
						navigate('/zakaat/donation/recipients');
						return;
					}
					setRecipient(found);
					// Fetch updates for this application
					fetchUpdates(found.applicationId);
				} else {
					alert.error('Recipient not found');
					navigate('/zakaat/donation/recipients');
				}
			}
		} catch (error: any) {
			alert.error(error.response?.data?.message || 'Failed to fetch recipient details');
			navigate('/zakaat/donation/recipients');
		} finally {
			setIsLoading(false);
		}
	};

	const fetchUpdates = async (_applicationId: string) => {
		try {
			setIsLoadingUpdates(true);
			// TODO: Implement API call to fetch updates
			// For now, using empty array - will be implemented when backend is ready
			setUpdates([]);
		} catch (error: any) {
			logger.error('Error fetching updates:', error);
		} finally {
			setIsLoadingUpdates(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
				<Loader size="lg" text="Loading recipient..." />
			</div>
		);
	}

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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-32">
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

					{/* Progress Tracker */}
					<ProgressTracker
						requestedAmount={recipient.requestedAmount}
						approvedAmount={recipient.approvedAmount}
						disbursedAmount={recipient.disbursedAmount}
						totalDonations={recipient.totalDonations}
						className="mb-4"
					/>

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

					{/* Updates & Feedback */}
					<div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 mb-4 shadow-lg">
						<div className="flex items-center gap-2 mb-4">
							<ChatBubbleLeftIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Updates & Appreciation
							</h3>
						</div>
						{isLoadingUpdates ? (
							<div className="flex items-center justify-center py-8">
								<Loader size="md" />
							</div>
						) : updates.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-sm text-slate-500 dark:text-slate-400">
									No updates yet. Check back later for progress updates and
									appreciation messages.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{updates.map((update) => (
									<div
										key={update.id}
										className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
									>
										<div className="flex items-start justify-between mb-2">
											<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
												{update.title}
											</h4>
											<span className="text-xs text-slate-500 dark:text-slate-400">
												{new Date(update.createdAt).toLocaleDateString(
													'en-US',
													{
														month: 'short',
														day: 'numeric',
														year: 'numeric',
													}
												)}
											</span>
										</div>
										<p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
											{update.description}
										</p>
										{update.images && update.images.length > 0 && (
											<div className="grid grid-cols-2 gap-2 mt-3">
												{update.images.map((img, idx) => (
													<img
														key={idx}
														src={img}
														alt={`Update ${idx + 1}`}
														className="w-full h-32 object-cover rounded-lg"
													/>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>

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

				{/* Fixed Action Button - positioned above bottom nav with proper spacing */}
				<div
					className="fixed bottom-24 left-0 right-0 px-4 z-40"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
				>
					<div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg rounded-t-2xl pt-3 pb-2">
						<button
							onClick={handleAddToBasket}
							disabled={isInBasket}
							className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary-500/30"
						>
							{isInBasket ? 'Already in Basket' : `Donate to ${recipient.firstName}`}
						</button>
					</div>
				</div>
			</div>

			{/* Bottom Navigation */}
			<BottomNavigation />

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
