import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useCurrencyStore } from '../store/currencyStore';
import { wealthCalculationService } from '../services/wealthCalculationService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import CurrencyDisplay from '../components/wealth/CurrencyDisplay';
import {
	ArrowLeftIcon,
	CalculatorIcon,
	EyeIcon,
	TrashIcon,
	CalendarIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { WealthCalculation } from '../types/wealth.types';

type FilterStatus = 'all' | 'active' | 'archived' | 'completed';

export default function CalculationsPage() {
	useTheme();
	const navigate = useNavigate();
	const { preferredCurrency } = useCurrencyStore();
	const [calculations, setCalculations] = useState<WealthCalculation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
	const [archivingId, setArchivingId] = useState<string | null>(null);

	const fetchCalculations = async () => {
		setIsLoading(true);
		try {
			const status = filterStatus === 'all' ? undefined : filterStatus;
			const response = await wealthCalculationService.getCalculations(page, 10, status);
			if (response?.data) {
				setCalculations(response.data.items);
				setTotalPages(response.data.pagination.totalPages);
			}
		} catch (error) {
			logger.error('Error fetching calculations:', error);
			alert.error('Failed to load calculations. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCalculations();
	}, [filterStatus, page]);

	const handleDelete = async (id: string) => {
		try {
			await wealthCalculationService.deleteCalculation(id);
			alert.success('Calculation deleted successfully');
			fetchCalculations();
			setDeleteDialogOpen(false);
			setCalculationToDelete(null);
		} catch (error) {
			logger.error('Error deleting calculation:', error);
			alert.error('Failed to delete calculation. Please try again.');
		}
	};

	const handleArchive = async (id: string, archive: boolean) => {
		setArchivingId(id);
		try {
			await wealthCalculationService.updateCalculation(id, {
				status: archive ? 'archived' : 'active',
			});
			alert.success(
				archive
					? 'Calculation archived successfully'
					: 'Calculation unarchived successfully'
			);
			fetchCalculations();
		} catch (error) {
			logger.error('Error archiving calculation:', error);
			alert.error('Failed to update calculation. Please try again.');
		} finally {
			setArchivingId(null);
		}
	};

	const handleMarkCompleted = async (id: string) => {
		try {
			await wealthCalculationService.updateCalculation(id, {
				status: 'completed',
			});
			alert.success('Calculation marked as completed');
			fetchCalculations();
		} catch (error) {
			logger.error('Error updating calculation:', error);
			alert.error('Failed to update calculation. Please try again.');
		}
	};

	const formatDate = (dateString: string | Date) => {
		const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
						Active
					</span>
				);
			case 'archived':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
						Archived
					</span>
				);
			case 'completed':
				return (
					<span className="px-2 py-1 text-xs font-semibold rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300">
						Completed
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate('/dashboard')}
							className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all active:scale-95"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<div>
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								My Calculations
							</h1>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								View and manage your saved Zakaat calculations
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Filters */}
			<div className="px-4 py-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b-2 border-slate-200/60 dark:border-slate-700/60">
				<div className="flex gap-2 overflow-x-auto scrollbar-hide">
					{(['all', 'active', 'archived', 'completed'] as FilterStatus[]).map(
						(status) => (
							<button
								key={status}
								onClick={() => {
									setFilterStatus(status);
									setPage(1);
								}}
								className={`px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
									filterStatus === status
										? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm shadow-primary-500/20'
										: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 shadow-sm'
								}`}
							>
								{status.charAt(0).toUpperCase() + status.slice(1)}
							</button>
						)
					)}
				</div>
			</div>

			{/* Content */}
			<main className="px-4 py-4">
				{isLoading ? (
					<LoadingSkeleton type="card" count={5} />
				) : calculations.length === 0 ? (
					<EmptyState
						icon={
							<CalculatorIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
						}
						title={
							filterStatus === 'all'
								? 'No calculations yet'
								: `No ${filterStatus} calculations`
						}
						description={
							filterStatus === 'all'
								? "You haven't saved any Zakaat calculations yet. Start by calculating your wealth and Zakaat eligibility."
								: `You don't have any ${filterStatus} calculations.`
						}
						action={
							filterStatus === 'all'
								? {
										label: 'Calculate Zakaat',
										onClick: () => navigate('/calculate'),
								  }
								: undefined
						}
					/>
				) : (
					<div className="space-y-3">
						{calculations.map((calculation) => (
							<motion.div
								key={calculation.id}
								initial={{ opacity: 0, y: 10, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{ type: 'spring', stiffness: 100 }}
								className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-lg border-2 border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
							>
								{/* Decorative gradient overlay */}
								<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
								{/* Header */}
								<div className="flex items-start justify-between mb-3 relative z-10">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											{calculation.name ? (
												<h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
													{calculation.name}
												</h3>
											) : (
												<h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
													Wealth Calculation
												</h3>
											)}
											{getStatusBadge(calculation.status)}
										</div>
										<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
											<CalendarIcon className="w-3.5 h-3.5" />
											<span>{formatDate(calculation.calculationDate)}</span>
										</div>
									</div>
									<button
										onClick={() => navigate(`/calculations/${calculation.id}`)}
										className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all"
										aria-label="View calculation details"
										type="button"
									>
										<EyeIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
									</button>
								</div>

								{/* Summary */}
								<div className="grid grid-cols-2 gap-3 mb-3 relative z-10">
									<div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl shadow-sm">
										<CurrencyDisplay
											amount={calculation.netWorth || 0}
											originalCurrency={
												calculation.currency || preferredCurrency || 'USD'
											}
											preferredCurrency={preferredCurrency || 'USD'}
											showLabel
											label="Net Worth"
											size="sm"
										/>
									</div>
									<div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl shadow-sm">
										{calculation.zakatDue !== null &&
										calculation.zakatDue !== undefined ? (
											<CurrencyDisplay
												amount={calculation.zakatDue}
												originalCurrency={
													calculation.currency ||
													preferredCurrency ||
													'USD'
												}
												preferredCurrency={preferredCurrency || 'USD'}
												showLabel
												label="Zakaat Due"
												size="sm"
												variant="success"
											/>
										) : (
											<>
												<p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
													Zakaat Due
												</p>
												<p className="text-sm font-bold text-slate-500 dark:text-slate-400">
													N/A
												</p>
											</>
										)}
									</div>
								</div>

								{/* Status indicator */}
								<div className="flex items-center gap-2 mb-3">
									{calculation.meetsNisaab ? (
										<div className="flex items-center gap-1.5 text-xs text-success-600 dark:text-success-400">
											<CheckCircleIconSolid className="w-4 h-4" />
											<span>
												Meets{' '}
												{calculation.nisaabBase === 'gold'
													? 'Gold'
													: 'Silver'}{' '}
												Nisaab
											</span>
										</div>
									) : (
										<div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
											<XCircleIcon className="w-4 h-4" />
											<span>
												Below{' '}
												{calculation.nisaabBase === 'gold'
													? 'Gold'
													: 'Silver'}{' '}
												Nisaab
											</span>
										</div>
									)}
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2 pt-3 border-t-2 border-slate-200/60 dark:border-slate-700/60 relative z-10">
									{calculation.status !== 'completed' && (
										<button
											onClick={() => handleMarkCompleted(calculation.id)}
											className="flex-1 px-3 py-2 text-xs font-semibold text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/20 rounded-lg hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors"
											type="button"
										>
											Mark Completed
										</button>
									)}
									{calculation.status === 'archived' ? (
										<button
											onClick={() => handleArchive(calculation.id, false)}
											disabled={archivingId === calculation.id}
											className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
											type="button"
										>
											Unarchive
										</button>
									) : (
										<button
											onClick={() => handleArchive(calculation.id, true)}
											disabled={archivingId === calculation.id}
											className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
											type="button"
										>
											Archive
										</button>
									)}
									<button
										onClick={() => {
											setCalculationToDelete(calculation.id);
											setDeleteDialogOpen(true);
										}}
										className="px-3 py-2 text-xs font-semibold text-error-700 dark:text-error-400 bg-error-50 dark:bg-error-900/20 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/30 transition-colors"
										type="button"
									>
										<TrashIcon className="w-4 h-4" />
									</button>
								</div>
							</motion.div>
						))}
					</div>
				)}

				{/* Pagination */}
				{!isLoading && calculations.length > 0 && totalPages > 1 && (
					<div className="flex items-center justify-center gap-2 mt-6">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
							type="button"
						>
							Previous
						</button>
						<span className="text-sm text-slate-600 dark:text-slate-400">
							Page {page} of {totalPages}
						</span>
						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
							type="button"
						>
							Next
						</button>
					</div>
				)}
			</main>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setCalculationToDelete(null);
				}}
				onConfirm={() => {
					if (calculationToDelete) {
						handleDelete(calculationToDelete);
					}
				}}
				title="Delete Calculation"
				message="Are you sure you want to delete this calculation? This action cannot be undone."
				confirmText="Delete"
				confirmVariant="danger"
			/>

			<BottomNavigation />
		</div>
	);
}
