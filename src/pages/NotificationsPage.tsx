import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
	CheckIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	XMarkIcon,
	InboxIcon,
	BellIcon,
	HeartIcon,
	ChatBubbleOvalLeftIcon,
	UserPlusIcon,
	ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { useTheme } from '../hooks/useTheme';
import { notificationService, type Notification } from '../services/notificationService';

export default function NotificationsPage() {
	useTheme();
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [onlyUnread, setOnlyUnread] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
	const observerTarget = useRef<HTMLDivElement>(null);
	const isFetchingRef = useRef(false);

	const fetchNotifications = useCallback(
		async (page: number, reset = false) => {
			if (isFetchingRef.current) return;

			isFetchingRef.current = true;
			if (reset) {
				setIsLoading(true);
			} else {
				setIsLoadingMore(true);
			}

			try {
				const response = await notificationService.getNotifications(page, 30, {
					onlyUnread,
					search: searchQuery || undefined,
					sortBy: 'createdAt',
					sortOrder: 'desc',
				});

				if (response.data && 'items' in response.data && 'pagination' in response.data) {
					const newItems = response.data.items;
					const pagination = response.data.pagination;

					if (reset) {
						setNotifications(newItems);
					} else {
						setNotifications((prev) => [...prev, ...newItems]);
					}

					setHasMore(page < pagination.totalPages);
					setCurrentPage(page);
				}
			} catch (error) {
				console.error('Failed to fetch notifications:', error);
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
				isFetchingRef.current = false;
			}
		},
		[onlyUnread, searchQuery]
	);

	useEffect(() => {
		fetchNotifications(1, true);
	}, [fetchNotifications]);

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasMore &&
					!isLoadingMore &&
					!isFetchingRef.current
				) {
					fetchNotifications(currentPage + 1, false);
				}
			},
			{ threshold: 0.1 }
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasMore, isLoadingMore, currentPage, fetchNotifications]);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await notificationService.markAsRead(notificationId);
			setNotifications((prev) =>
				prev.map((notif) =>
					notif.id === notificationId ? { ...notif, isRead: true } : notif
				)
			);
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		setIsMarkingAllRead(true);
		try {
			await notificationService.markAllAsRead();
			setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		} finally {
			setIsMarkingAllRead(false);
		}
	};

	const handleFilterToggle = () => {
		setOnlyUnread(!onlyUnread);
		setCurrentPage(1);
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	// Refetch when filters change
	useEffect(() => {
		fetchNotifications(1, true);
	}, [onlyUnread, searchQuery, fetchNotifications]);

	const formatTimeAgo = (dateString: string): string => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInSeconds = Math.floor(diffInMs / 1000);
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);
		const diffInWeeks = Math.floor(diffInDays / 7);
		const diffInMonths = Math.floor(diffInDays / 30);

		if (diffInSeconds < 60) return 'Just now';
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInHours < 24) return `${diffInHours}h ago`;
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays}d ago`;
		if (diffInWeeks === 1) return '1 week ago';
		if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
		if (diffInMonths === 1) return '1 month ago';
		if (diffInMonths < 12) return `${diffInMonths}mo ago`;
		return `${Math.floor(diffInMonths / 12)}y ago`;
	};

	/**
	 * Get navigation path based on notification metadata
	 */
	const getNotificationPath = (notification: Notification): string | null => {
		if (!notification.metadata || !notification.metadata.type) {
			return null;
		}

		const { type, postId, followerId } = notification.metadata;

		switch (type) {
			case 'post_liked':
				return postId ? `/community/posts/${postId}` : null;
			case 'comment_created':
			case 'comment_reply':
				return postId ? `/community/posts/${postId}` : null;
			case 'comment_liked':
				// Navigate to the post that contains the comment
				return postId ? `/community/posts/${postId}` : null;
			case 'user_followed':
				return followerId ? `/community/members/${followerId}` : null;
			default:
				return null;
		}
	};

	/**
	 * Handle notification click - navigate and mark as read
	 */
	const handleNotificationClick = async (notification: Notification) => {
		const path = getNotificationPath(notification);

		// Mark as read if unread
		if (!notification.isRead) {
			try {
				await notificationService.markAsRead(notification.id);
				setNotifications((prev) =>
					prev.map((notif) =>
						notif.id === notification.id ? { ...notif, isRead: true } : notif
					)
				);
			} catch (error) {
				console.error('Failed to mark notification as read:', error);
			}
		}

		// Navigate to relevant page
		if (path) {
			navigate(path);
		}
	};

	const hasUnreadNotifications = notifications.some((notif) => !notif.isRead);
	const unreadNotificationsCount = notifications.filter((notif) => !notif.isRead).length;

	// Get notification icon based on type
	const getNotificationIcon = (notification: Notification) => {
		const type = notification.metadata?.type;
		switch (type) {
			case 'post_liked':
			case 'comment_liked':
				return HeartIcon;
			case 'comment_created':
			case 'comment_reply':
				return ChatBubbleOvalLeftIcon;
			case 'user_followed':
				return UserPlusIcon;
			default:
				return BellIcon;
		}
	};

	// Get notification color based on type
	const getNotificationColor = (notification: Notification) => {
		const type = notification.metadata?.type;
		switch (type) {
			case 'post_liked':
			case 'comment_liked':
				return 'from-red-500 to-pink-600';
			case 'comment_created':
			case 'comment_reply':
				return 'from-primary-500 to-primary-600';
			case 'user_followed':
				return 'from-blue-500 to-cyan-600';
			default:
				return 'from-slate-500 to-slate-600';
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			<PageHeader
				title="Notifications"
				showBack
				rightAction={
					hasUnreadNotifications && (
						<button
							onClick={handleMarkAllAsRead}
							disabled={isMarkingAllRead}
							className="px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-primary-50 dark:bg-primary-900/20 rounded-lg"
						>
							{isMarkingAllRead ? 'Marking...' : 'Mark all read'}
						</button>
					)
				}
			/>

			<main className="px-4 py-4">
				{/* Hero Stats Section */}
				{unreadNotificationsCount > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-5 shadow-xl"
					>
						{/* Decorative elements */}
						<div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
						<div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-500/20 rounded-full blur-2xl" />
						
						<div className="relative z-10 flex items-center gap-4">
							<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
								<BellIcon className="w-8 h-8 text-white" />
							</div>
							<div className="flex-1">
								<p className="text-xs text-white/80 mb-1">Unread Notifications</p>
								<p className="text-3xl font-bold text-white">{unreadNotificationsCount}</p>
							</div>
							{hasUnreadNotifications && (
								<button
									onClick={handleMarkAllAsRead}
									disabled={isMarkingAllRead}
									className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
								>
									Mark All Read
								</button>
							)}
						</div>
					</motion.div>
				)}

				{/* Search and Filter */}
				<div className="mb-4 space-y-3">
					{/* Search */}
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder="Search notifications..."
							className="w-full pl-12 pr-10 py-3 text-sm rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
						/>
						{searchQuery && (
							<button
								onClick={() => handleSearchChange('')}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							>
								<XMarkIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
							</button>
						)}
					</div>

					{/* Filter Toggle */}
					<button
						onClick={handleFilterToggle}
						className={`w-full px-4 py-3 rounded-2xl border-2 transition-all text-sm font-semibold flex items-center justify-center gap-2 ${
							onlyUnread
								? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 shadow-sm'
								: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
						}`}
					>
						<FunnelIcon className="w-5 h-5" />
						{onlyUnread ? 'Showing unread only' : 'Show all'}
						{onlyUnread && unreadNotificationsCount > 0 && (
							<span className="ml-1 px-2.5 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
								{unreadNotificationsCount}
							</span>
						)}
					</button>
				</div>

				{/* Notifications List */}
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
				) : notifications.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-12 shadow-lg border border-slate-200/60 dark:border-slate-700/60 text-center"
					>
						<div className="relative inline-block mb-4">
							<div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl" />
							<InboxIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 relative z-10 mx-auto" />
						</div>
						<p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
							{onlyUnread
								? 'No unread notifications'
								: searchQuery
								? 'No notifications found'
								: 'No notifications'}
						</p>
						<p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
							{onlyUnread
								? "You're all caught up! 🎉"
								: searchQuery
								? 'Try adjusting your search terms.'
								: "You'll see notifications here when they arrive."}
						</p>
					</motion.div>
				) : (
					<>
						<div className="space-y-3">
							{notifications.map((notification, index) => {
								const hasNavigation = getNotificationPath(notification) !== null;
								const NotificationIcon = getNotificationIcon(notification);
								const iconColor = getNotificationColor(notification);
								
								return (
									<motion.div
										key={notification.id}
										initial={{ opacity: 0, y: 20, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										transition={{ 
											delay: index * 0.03,
											type: "spring",
											stiffness: 100
										}}
										whileHover={hasNavigation ? { scale: 1.02, y: -2 } : {}}
										className={`group relative overflow-hidden rounded-2xl p-4 shadow-lg border transition-all duration-300 ${
											notification.isRead
												? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200/60 dark:border-slate-700/60 opacity-80'
												: 'bg-gradient-to-br from-primary-50/50 via-white to-slate-50 dark:from-primary-900/20 dark:via-slate-800 dark:to-slate-900 border-primary-200/60 dark:border-primary-800/60 shadow-primary-500/10'
										} ${hasNavigation ? 'cursor-pointer hover:shadow-xl' : ''}`}
										onClick={() => hasNavigation && handleNotificationClick(notification)}
									>
										{/* Decorative gradient overlay for unread */}
										{!notification.isRead && (
											<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-2xl -z-0" />
										)}
										
										<div className="flex items-start gap-4 relative z-10">
											{/* Icon */}
											<div className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
												<NotificationIcon className="w-6 h-6 text-white" />
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-2">
													<h3
														className={`text-base font-bold ${
															notification.isRead
																? 'text-slate-700 dark:text-slate-300'
																: 'text-slate-900 dark:text-slate-100'
														}`}
													>
														{notification.title}
													</h3>
													{!notification.isRead && (
														<button
															onClick={(e) => {
																e.stopPropagation();
																handleMarkAsRead(notification.id);
															}}
															className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors shrink-0"
															title="Mark as read"
														>
															<CheckIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
														</button>
													)}
												</div>

												{notification.message && (
													<p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
														{notification.message}
													</p>
												)}

												<div className="flex items-center justify-between">
													<p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
														{formatTimeAgo(notification.createdAt)}
													</p>
													<div className="flex items-center gap-2">
														{hasNavigation && (
															<span className="text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
																View
																<ArrowRightIcon className="w-3.5 h-3.5" />
															</span>
														)}
														{notification.isRead && (
															<CheckIconSolid className="w-4 h-4 text-slate-400 dark:text-slate-500" />
														)}
													</div>
												</div>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>

						{/* Infinite Scroll Trigger */}
						<div
							ref={observerTarget}
							className="h-10 flex items-center justify-center py-4"
						>
							{isLoadingMore && (
								<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
									<div className="w-4 h-4 border-2 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
									Loading more...
								</div>
							)}
							{!hasMore && notifications.length > 0 && (
								<p className="text-xs text-slate-500 dark:text-slate-400">
									No more notifications
								</p>
							)}
						</div>
					</>
				)}
			</main>

			<BottomNavigation />
		</div>
	);
}
