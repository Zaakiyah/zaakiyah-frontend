import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { alert } from '../../store/alertStore';
import { sessionService, type Session } from '../../services/sessionService';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
	DevicePhoneMobileIcon,
	ComputerDesktopIcon,
	TrashIcon,
	GlobeAltIcon,
	ClockIcon,
	CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function LoginSessionsSection() {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [isDeletingAll, setIsDeletingAll] = useState(false);
	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	const [deleteSessionDialogOpen, setDeleteSessionDialogOpen] = useState(false);
	const [deleteAllSessionsDialogOpen, setDeleteAllSessionsDialogOpen] = useState(false);
	const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
	const observerTarget = useRef<HTMLDivElement>(null);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const isFetchingRef = useRef(false);

	const fetchSessions = useCallback(async (page = 1, reset = false) => {
		if (isFetchingRef.current) return;

		isFetchingRef.current = true;
		try {
			const response = await sessionService.getSessions(page, 20);
			if (response.data) {
				const newSessions = response.data.items || [];
				setSessions((prev) => (reset ? newSessions : [...prev, ...newSessions]));
				setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
				setCurrentPage(page);
			}
		} catch (error) {
			console.error('Failed to fetch sessions:', error);
		} finally {
			isFetchingRef.current = false;
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSessions(1, true);
	}, [fetchSessions]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
					fetchSessions(currentPage + 1);
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
	}, [hasMore, currentPage, fetchSessions]);

	// Identify current session (the most recent one)
	useEffect(() => {
		if (sessions.length > 0) {
			const sortedSessions = [...sessions].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			setCurrentSessionId(sortedSessions[0]?.id || null);
		}
	}, [sessions]);

	const handleDeleteSessionClick = (sessionId: string) => {
		if (sessionId === currentSessionId) {
			alert.warning(
				'You cannot delete your current session. Please use another device to delete it.',
				'Cannot Delete Session'
			);
			return;
		}
		setSessionToDelete(sessionId);
		setDeleteSessionDialogOpen(true);
	};

	const handleDeleteSession = async () => {
		if (!sessionToDelete) return;

		setIsDeleting(sessionToDelete);
		try {
			await sessionService.deleteSession(sessionToDelete);
			setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
			setDeleteSessionDialogOpen(false);
			setSessionToDelete(null);
		} catch (error) {
			console.error('Failed to delete session:', error);
			alert.error('Failed to delete session. Please try again.', 'Error');
		} finally {
			setIsDeleting(null);
		}
	};

	const handleDeleteAllSessionsConfirm = async () => {
		setIsDeletingAll(true);
		try {
			await sessionService.deleteAllSessions();
			// Keep only the current session
			const currentSession = sessions.find((s) => s.id === currentSessionId);
			setSessions(currentSession ? [currentSession] : []);
			setDeleteAllSessionsDialogOpen(false);
		} catch (error) {
			console.error('Failed to delete all sessions:', error);
			alert.error('Failed to delete sessions. Please try again.', 'Error');
		} finally {
			setIsDeletingAll(false);
		}
	};

	const getDeviceIcon = (userAgent: string | null) => {
		if (!userAgent) return <GlobeAltIcon className="w-5 h-5" />;
		const ua = userAgent.toLowerCase();
		if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
			return <DevicePhoneMobileIcon className="w-5 h-5" />;
		}
		return <ComputerDesktopIcon className="w-5 h-5" />;
	};

	const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
		>
			<div className="flex items-start justify-between gap-3 mb-4">
				<div className="flex items-start gap-3 flex-1">
					<div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
						<DevicePhoneMobileIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
					</div>
					<div className="flex-1">
						<h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Login Sessions</h2>
						<p className="text-xs text-slate-600 dark:text-slate-400">
							Manage devices where you're logged in
						</p>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="py-8 text-center">
					<div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
				</div>
			) : (
				<div className="space-y-3">
					{/* Current Session */}
					{sessions.find((s) => s.id === currentSessionId) && (
						<div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800/30">
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3 flex-1">
									<div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0 text-primary-600 dark:text-primary-400">
										{getDeviceIcon(
											sessions.find((s) => s.id === currentSessionId)?.userAgent || null
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
												{sessions.find((s) => s.id === currentSessionId)?.deviceName ||
													'This Device'}
											</p>
											<CheckCircleIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
											<span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Current</span>
										</div>
										{sessions.find((s) => s.id === currentSessionId)?.location && (
											<p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
												{sessions.find((s) => s.id === currentSessionId)?.location}
											</p>
										)}
										<div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
											<div className="flex items-center gap-1">
												<ClockIcon className="w-3.5 h-3.5" />
												<span>
													{sessions.find((s) => s.id === currentSessionId)?.formattedTime}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Other Sessions */}
					{otherSessions.length > 0 && (
						<>
							<div className="flex items-center justify-between pt-2">
								<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
									Other Devices ({otherSessions.length})
								</p>
								{otherSessions.length > 1 && (
									<button
										onClick={() => setDeleteAllSessionsDialogOpen(true)}
										disabled={isDeletingAll}
										className="text-xs font-semibold text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-500 disabled:opacity-50"
									>
										{isDeletingAll ? 'Logging out...' : 'Log out all'}
									</button>
								)}
							</div>

							<div className="space-y-2">
								{otherSessions.map((session) => (
									<div
										key={session.id}
										className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-start gap-3 flex-1">
												<div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
													{getDeviceIcon(session.userAgent)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
														{session.deviceName || 'Unknown Device'}
													</p>
													{session.location && (
														<p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{session.location}</p>
													)}
													<div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
														<div className="flex items-center gap-1">
															<ClockIcon className="w-3.5 h-3.5" />
															<span>{session.formattedTime}</span>
														</div>
													</div>
												</div>
											</div>
											<button
												onClick={() => handleDeleteSessionClick(session.id)}
												disabled={isDeleting === session.id}
												className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-error-600 dark:text-error-400 transition-colors disabled:opacity-50"
												title="Log out this device"
											>
												{isDeleting === session.id ? (
													<div className="w-4 h-4 border-2 border-error-600 dark:border-error-400 border-t-transparent rounded-full animate-spin" />
												) : (
													<TrashIcon className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{otherSessions.length === 0 && (
						<p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
							No other active sessions
						</p>
					)}

					{hasMore && (
						<div ref={observerTarget} className="h-4 flex items-center justify-center">
							<div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
						</div>
					)}
				</div>
			)}

			{/* Delete Session Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteSessionDialogOpen}
				onClose={() => {
					setDeleteSessionDialogOpen(false);
					setSessionToDelete(null);
				}}
				onConfirm={handleDeleteSession}
				title="Log Out Device"
				message="Are you sure you want to log out this device? You will need to log in again on that device."
				variant="warning"
				confirmText="Log Out"
				cancelText="Cancel"
				isLoading={isDeleting !== null}
			/>

			{/* Delete All Sessions Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteAllSessionsDialogOpen}
				onClose={() => setDeleteAllSessionsDialogOpen(false)}
				onConfirm={handleDeleteAllSessionsConfirm}
				title="Log Out All Other Devices"
				message="Are you sure you want to log out all other devices? You will remain logged in on this device."
				variant="warning"
				confirmText="Log Out All"
				cancelText="Cancel"
				isLoading={isDeletingAll}
			/>
		</motion.div>
	);
}

