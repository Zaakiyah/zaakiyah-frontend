import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	DocumentTextIcon,
	ClockIcon,
	XCircleIcon,
	ArrowPathIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import PageHeader from '../../components/layout/PageHeader';
import BottomNavigation from '../../components/layout/BottomNavigation';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useTheme } from '../../hooks/useTheme';
import { zakaatService } from '../../services/zakaatService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import LoadingSkeleton from '../../components/wealth/LoadingSkeleton';
import EmptyState from '../../components/wealth/EmptyState';
import type { ZakaatApplication, ApplicationStatus } from '../../types/zakaat.types';

export default function ZakaatApplicationPage() {
	useTheme();
	const navigate = useNavigate();
	const [applications, setApplications] = useState<ZakaatApplication[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
	const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [selectedApplication, setSelectedApplication] = useState<ZakaatApplication | null>(null);

	useEffect(() => {
		fetchApplications();
	}, []);

	const fetchApplications = async () => {
		try {
			setIsLoading(true);
			const response = await zakaatService.getApplications();
			if (response.data) {
				setApplications(response.data.data);
			}
		} catch (error: any) {
			logger.error('Error fetching applications:', error);
			alert.error(error.response?.data?.message || 'Failed to load applications');
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusColor = (status: ApplicationStatus) => {
		switch (status) {
			case 'draft':
				return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
			case 'submitted':
			case 'under_review':
				return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
			case 'approved':
				return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
			case 'rejected':
				return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
			case 'disbursed':
			case 'completed':
				return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
			default:
				return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
		}
	};

	const getStatusIcon = (status: ApplicationStatus) => {
		switch (status) {
			case 'draft':
				return DocumentTextIcon;
			case 'submitted':
			case 'under_review':
				return ClockIcon;
			case 'approved':
			case 'disbursed':
			case 'completed':
				return CheckCircleIconSolid;
			case 'rejected':
				return XCircleIcon;
			default:
				return DocumentTextIcon;
		}
	};

	const formatStatus = (status: ApplicationStatus) => {
		return status
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const handleWithdrawClick = (e: React.MouseEvent, application: ZakaatApplication) => {
		e.stopPropagation();
		setSelectedApplication(application);
		setShowWithdrawConfirm(true);
	};

	const handleWithdrawConfirm = async () => {
		if (!selectedApplication) return;

		try {
			setWithdrawingId(selectedApplication.id);
			await zakaatService.withdrawApplication(selectedApplication.id);
			alert.success('Application withdrawn successfully');
			setShowWithdrawConfirm(false);
			setSelectedApplication(null);
			fetchApplications(); // Refresh list
		} catch (error: any) {
			logger.error('Error withdrawing application:', error);
			alert.error(error.response?.data?.message || 'Failed to withdraw application');
		} finally {
			setWithdrawingId(null);
		}
	};

	const handleDeleteClick = (e: React.MouseEvent, application: ZakaatApplication) => {
		e.stopPropagation();
		setSelectedApplication(application);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		if (!selectedApplication) return;

		try {
			setDeletingId(selectedApplication.id);
			await zakaatService.deleteApplication(selectedApplication.id);
			alert.success('Application deleted successfully');
			setShowDeleteConfirm(false);
			setSelectedApplication(null);
			fetchApplications(); // Refresh list
		} catch (error: any) {
			logger.error('Error deleting application:', error);
			alert.error(error.response?.data?.message || 'Failed to delete application');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			<PageHeader
				title="Zakaat Applications"
				subtitle="Manage your applications and campaigns"
				showBack
			/>

			<main className="px-4 py-4">
				{/* New Application Button */}
				{!isLoading && applications.length > 0 && (
					<motion.button
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						onClick={() => navigate('/zakaat/apply?new=true')}
						className="w-full mb-4 px-4 py-3 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2 font-semibold"
					>
						<DocumentTextIcon className="w-5 h-5" />
						New Application
					</motion.button>
				)}

				{/* Applications List */}
				{isLoading ? (
					<div className="space-y-3">
						<LoadingSkeleton type="card" count={3} />
					</div>
				) : applications.length === 0 ? (
					<EmptyState
						title="No applications yet"
						description="Start by creating a new Zakaat application"
						action={{
							label: 'Apply for Zakaat',
							onClick: () => navigate('/zakaat/apply?new=true'),
						}}
					/>
				) : (
					<div className="space-y-3">
						{applications.map((application) => {
							const StatusIcon = getStatusIcon(application.status);
							const canWithdraw = ['submitted', 'under_review'].includes(
								application.status
							);
							const canDelete = application.status === 'draft';
							return (
								<motion.div
									key={application.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all"
								>
									{/* Decorative gradient overlay */}
									<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
									{/* Campaign Image */}
									{application.campaignImageUrl && (
										<div className="w-full h-48 overflow-hidden">
											<img
												src={application.campaignImageUrl}
												alt="Campaign"
												className="w-full h-full object-cover"
											/>
										</div>
									)}
									<div className="p-4">
										<div className="flex items-start justify-between mb-2">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<StatusIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
													<h3 className="font-semibold text-slate-900 dark:text-slate-100">
														{application.applicationType ===
														'individual'
															? 'Individual Application'
															: 'Organization Application'}
													</h3>
												</div>
												{application.requestedAmount && (
													<p className="text-sm text-slate-600 dark:text-slate-400">
														Amount: $
														{application.requestedAmount.toLocaleString()}
													</p>
												)}
											</div>
											<span
												className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
													application.status
												)}`}
											>
												{formatStatus(application.status)}
											</span>
										</div>
										<div className="flex items-center justify-between mt-3">
											<div className="text-xs text-slate-500 dark:text-slate-400">
												{new Date(application.createdAt).toLocaleDateString(
													'en-US',
													{
														month: 'short',
														day: 'numeric',
														year: 'numeric',
													}
												)}
											</div>
											<div className="flex items-center gap-2 flex-wrap">
												{canWithdraw && (
													<button
														onClick={(e) =>
															handleWithdrawClick(e, application)
														}
														disabled={withdrawingId === application.id}
														className="px-3 py-2 sm:py-1.5 text-xs sm:text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50 flex items-center gap-1.5 min-h-[36px] sm:min-h-0"
													>
														{withdrawingId === application.id ? (
															<>
																<div className="w-3 h-3 border-2 border-amber-600/30 dark:border-amber-500/30 border-t-amber-600 dark:border-t-amber-500 rounded-full animate-spin" />
																<span className="hidden sm:inline">Withdrawing...</span>
															</>
														) : (
															<>
																<ArrowPathIcon className="w-3.5 h-3.5" />
																<span className="hidden sm:inline">Withdraw</span>
															</>
														)}
													</button>
												)}
												{canDelete && (
													<button
														onClick={(e) =>
															handleDeleteClick(e, application)
														}
														className="p-2 sm:p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[36px] sm:min-h-0"
														title="Delete draft"
													>
														<TrashIcon className="w-4 h-4" />
													</button>
												)}
												<button
													onClick={() =>
														navigate(
															`/zakaat/applications/${application.id}`
														)
													}
													className="px-3 py-2 sm:py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors min-h-[36px] sm:min-h-0"
												>
													View
												</button>
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				)}
			</main>

			<BottomNavigation />

			{/* Withdraw Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showWithdrawConfirm}
				onClose={() => {
					setShowWithdrawConfirm(false);
					setSelectedApplication(null);
				}}
				onConfirm={handleWithdrawConfirm}
				title="Withdraw Application"
				message="Are you sure you want to withdraw this application? This action cannot be undone."
				confirmText="Withdraw"
				variant="warning"
				confirmVariant="danger"
				isLoading={withdrawingId !== null}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				onClose={() => {
					setShowDeleteConfirm(false);
					setSelectedApplication(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Application"
				message="Are you sure you want to delete this draft application? This action cannot be undone."
				confirmText="Delete"
				variant="danger"
				confirmVariant="danger"
				isLoading={deletingId !== null}
			/>
		</div>
	);
}
