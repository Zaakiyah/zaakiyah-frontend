import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { usePullToRefreshContext } from '../../contexts/PullToRefreshContext';

export default function GlobalPullToRefresh() {
	const location = useLocation();
	const { getRefreshFunction } = usePullToRefreshContext();
	const [isRefreshing, setIsRefreshing] = useState(false);

	usePullToRefresh({
		onRefresh: async () => {
			setIsRefreshing(true);
			try {
				const refreshFn = getRefreshFunction(location.pathname);
				if (refreshFn) {
					await refreshFn();
				} else {
					// Fallback: reload the page if no specific refresh function is registered
					window.location.reload();
				}
			} finally {
				setIsRefreshing(false);
			}
		},
		enabled: true,
	});

	return (
		<>
			{/* Global pull to refresh indicator */}
			{isRefreshing && (
				<div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[100] bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-lg border-2 border-primary-500/20 dark:border-primary-400/20">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 border-2 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
						<span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Refreshing...</span>
					</div>
				</div>
			)}
		</>
	);
}

