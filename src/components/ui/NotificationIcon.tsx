import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../../services/notificationService';
import { logger } from '../../utils/logger';

interface NotificationIconProps {
	className?: string;
}

export default function NotificationIcon({ className = '' }: NotificationIconProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [unreadCount, setUnreadCount] = useState(0);

	// Fetch unread notification count
	const fetchUnreadCount = useCallback(async () => {
		try {
			const response = await notificationService.getUnreadCount();
			if (response.data) {
				setUnreadCount(response.data.count || 0);
			}
		} catch (error) {
			logger.error('Error fetching unread count:', error);
		}
	}, []);

	// Initial fetch and periodic refresh
	useEffect(() => {
		fetchUnreadCount();
		// Refresh unread count every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);
		return () => clearInterval(interval);
	}, [fetchUnreadCount]);

	// Refresh when page becomes visible (user switches back to tab)
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (!document.hidden) {
				fetchUnreadCount();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [fetchUnreadCount]);

	// Refresh when navigating back from notifications page
	useEffect(() => {
		if (location.pathname !== '/notifications') {
			// Small delay to ensure backend has updated after marking as read
			const timeout = setTimeout(() => {
				fetchUnreadCount();
			}, 500);
			return () => clearTimeout(timeout);
		}
	}, [location.pathname, fetchUnreadCount]);

	return (
		<button
			onClick={() => navigate('/notifications')}
			className={`relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 ${className}`}
			aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
			type="button"
		>
			<BellIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
			{unreadCount > 0 && (
				<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-slate-800">
					{unreadCount > 99 ? '99+' : unreadCount}
				</span>
			)}
		</button>
	);
}




