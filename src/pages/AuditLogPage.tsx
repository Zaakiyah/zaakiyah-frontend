import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
	ShieldCheckIcon,
	ExclamationTriangleIcon,
	XCircleIcon,
	InformationCircleIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../components/layout/PageHeader';
import { useTheme } from '../hooks/useTheme';
import { auditLogService, type AuditLog } from '../services/auditLogService';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../utils/logger';

export default function AuditLogPage() {
	useTheme();
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
	const [isExporting, setIsExporting] = useState(false);
	const observerTarget = useRef<HTMLDivElement>(null);
	const isFetchingRef = useRef(false);

	const fetchLogs = useCallback(
		async (page: number, reset = false) => {
			if (isFetchingRef.current) return;

			isFetchingRef.current = true;
			if (reset) {
				setIsLoading(true);
			} else {
				setIsLoadingMore(true);
			}

			try {
				const params: any = {
					page,
					limit: 20,
				};

				if (searchQuery) {
					params.action = searchQuery;
				}

				if (selectedSeverity !== 'all') {
					params.severity = selectedSeverity;
				}

				const response = await auditLogService.getMyAuditLogs(params);
				if (response.data) {
					const newLogs = response.data.items;
					const pagination = response.data.pagination;

					if (reset) {
						setLogs(newLogs);
					} else {
						setLogs((prev) => [...prev, ...newLogs]);
					}

					setHasMore(page < pagination.totalPages);
					setCurrentPage(page);
				}
			} catch (error) {
				logger.error('Failed to fetch audit logs:', error);
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
				isFetchingRef.current = false;
			}
		},
		[searchQuery, selectedSeverity]
	);

	useEffect(() => {
		fetchLogs(1, true);
	}, [fetchLogs]);

	// Infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					fetchLogs(currentPage + 1);
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget.current);
			}
		};
	}, [hasMore, isLoadingMore, currentPage, fetchLogs]);

	const getSeverityIcon = (severity: string) => {
		switch (severity) {
			case 'critical':
			case 'error':
				return XCircleIcon;
			case 'warning':
				return ExclamationTriangleIcon;
			default:
				return InformationCircleIcon;
		}
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'from-red-600 to-red-700';
			case 'error':
				return 'from-red-500 to-red-600';
			case 'warning':
				return 'from-yellow-500 to-yellow-600';
			default:
				return 'from-blue-500 to-blue-600';
		}
	};

	const formatAction = (action: string): string => {
		return action
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const params: any = {};
			if (searchQuery) params.action = searchQuery;
			if (selectedSeverity !== 'all') params.severity = selectedSeverity;

			const blob = await auditLogService.exportMyAuditLogs(params);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `my-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			logger.error('Failed to export audit logs:', error);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			<PageHeader title="Activity Log" showBack />

			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Export Button */}
				<div className="mb-4 flex justify-end">
					<button
						onClick={handleExport}
						disabled={isExporting}
						className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-lg"
					>
						<ArrowDownTrayIcon className="w-5 h-5" />
						{isExporting ? 'Exporting...' : 'Export CSV'}
					</button>
				</div>

				{/* Info Banner */}
				<div className="mb-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 border border-primary-200 dark:border-primary-800">
					<div className="flex items-start gap-3">
						<ShieldCheckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-1">
								Activity Log
							</p>
							<p className="text-xs text-primary-700 dark:text-primary-300">
								This log shows all your activities including logins, password
								changes, profile updates, and other system actions. You can filter
								by severity to focus on specific types of activities.
							</p>
						</div>
					</div>
				</div>

				{/* Search and Filter */}
				<div className="mb-4 space-y-3">
					{/* Search */}
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by action..."
							className="w-full pl-12 pr-10 py-3 text-sm rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							>
								<XCircleIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
							</button>
						)}
					</div>

					{/* Severity Filter */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2">
						<FunnelIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
						<button
							onClick={() => setSelectedSeverity('all')}
							className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
								selectedSeverity === 'all'
									? 'bg-primary-600 text-white shadow-lg'
									: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700'
							}`}
						>
							All
						</button>
						{['critical', 'error', 'warning', 'info'].map((severity) => (
							<button
								key={severity}
								onClick={() => setSelectedSeverity(severity)}
								className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all capitalize ${
									selectedSeverity === severity
										? 'bg-primary-600 text-white shadow-lg'
										: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700'
								}`}
							>
								{severity}
							</button>
						))}
					</div>
				</div>

				{/* Audit Logs List */}
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200/60 dark:border-slate-700/60 animate-pulse"
							>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
										<div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : logs.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-12 shadow-lg border border-slate-200/60 dark:border-slate-700/60 text-center"
					>
						<ShieldCheckIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
						<p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
							No activities found
						</p>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							{searchQuery || selectedSeverity !== 'all'
								? 'Try adjusting your filters.'
								: "You don't have any activities logged yet."}
						</p>
					</motion.div>
				) : (
					<div className="space-y-3">
						{logs.map((log, index) => {
							const SeverityIcon = getSeverityIcon(log.severity);
							const severityColor = getSeverityColor(log.severity);

							return (
								<motion.div
									key={log.id}
									initial={{ opacity: 0, y: 20, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{
										delay: index * 0.03,
										type: 'spring',
										stiffness: 100,
									}}
									className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
								>
									<div className="flex items-start gap-4">
										{/* Icon */}
										<div
											className={`w-12 h-12 bg-gradient-to-br ${severityColor} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
										>
											<SeverityIcon className="w-6 h-6 text-white" />
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2 mb-2">
												<div className="flex-1 min-w-0">
													<h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
														{formatAction(log.action)}
													</h3>
													{log.resourceType && (
														<p className="text-xs text-slate-500 dark:text-slate-400">
															{log.resourceType}
															{log.resourceId &&
																` • ${log.resourceId.substring(
																	0,
																	8
																)}...`}
														</p>
													)}
												</div>
												<span
													className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize flex-shrink-0 ${
														log.severity === 'critical'
															? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
															: log.severity === 'error'
															? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
															: log.severity === 'warning'
															? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
															: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
													}`}
												>
													{log.severity}
												</span>
											</div>

											{log.details && (
												<div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
													<pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
														{JSON.stringify(log.details, null, 2)}
													</pre>
												</div>
											)}

											<div className="flex items-center justify-between mt-3">
												<p className="text-xs text-slate-500 dark:text-slate-400">
													{formatDistanceToNow(new Date(log.createdAt), {
														addSuffix: true,
													})}
												</p>
												{log.ipAddress && (
													<p className="text-xs text-slate-400 dark:text-slate-500">
														{log.ipAddress}
													</p>
												)}
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				)}

				{/* Infinite Scroll Trigger */}
				<div ref={observerTarget} className="h-10 flex items-center justify-center py-4">
					{isLoadingMore && (
						<div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
					)}
				</div>
			</div>
		</div>
	);
}
