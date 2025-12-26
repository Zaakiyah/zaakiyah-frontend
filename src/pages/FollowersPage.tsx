import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { communityService } from '../services/communityService';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import FollowButton from '../components/community/FollowButton';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { UserInfo } from '../types/community.types';

export default function FollowersPage() {
	useTheme();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [followers, setFollowers] = useState<UserInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [memberName, setMemberName] = useState('');

	const fetchFollowers = useCallback(
		async (pageNum: number = 1, append: boolean = false) => {
			if (!id) return;
			try {
				if (pageNum === 1) {
					setIsLoading(true);
				} else {
					setLoadingMore(true);
				}

				const response = await communityService.getFollowers(id, pageNum, 20);
				if (response.data) {
					if (append) {
						setFollowers((prev) => [...prev, ...response.data.items]);
					} else {
						setFollowers(response.data.items);
					}
					setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
					
					// Get member name from first follower's context or fetch separately
					if (pageNum === 1 && response.data.items.length > 0) {
						// Try to get member name from profile
						try {
							const postsResponse = await communityService.getPosts({ userId: id, limit: 1 });
							if (postsResponse.data && postsResponse.data.items.length > 0) {
								const member = postsResponse.data.items[0].author;
								setMemberName(`${member.firstName} ${member.lastName}`);
							}
						} catch (error) {
							logger.error('Error fetching member name:', error);
						}
					}
				}
			} catch (error: any) {
				logger.error('Error fetching followers:', error);
			} finally {
				setIsLoading(false);
				setLoadingMore(false);
			}
		},
		[id],
	);

	useEffect(() => {
		fetchFollowers(1, false);
	}, [fetchFollowers]);

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchFollowers(nextPage, true);
		}
	};

	const handleFollowChange = (followerId: string, isFollowing: boolean) => {
		setFollowers((prev) =>
			prev.map((follower) =>
				follower.id === followerId ? { ...follower, isFollowing } : follower
			)
		);
	};

	const getInitials = (firstName: string, lastName: string) => {
		return (
			`${firstName?.[0]?.toUpperCase() || ''}${lastName?.[0]?.toUpperCase() || ''}`.trim() ||
			'U'
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-lg">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate(-1)}
							className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<div className="flex-1">
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
								{memberName ? `${memberName}'s Followers` : 'Followers'}
							</h1>
						</div>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4">
				{isLoading ? (
					<div className="space-y-4">
						<LoadingSkeleton type="card" count={5} />
					</div>
				) : followers.length === 0 ? (
					<EmptyState
						title="No followers yet"
						description="This user doesn't have any followers yet"
					/>
				) : (
					<div className="space-y-3">
						{followers.map((follower) => (
							<div
								key={follower.id}
								className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 flex items-center gap-3 shadow-lg"
							>
								<button
									onClick={() => navigate(`/community/members/${follower.id}`)}
									className="flex items-center gap-3 flex-1 min-w-0"
								>
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0">
										{follower.avatarUrl ? (
											<img
												src={follower.avatarUrl}
												alt={follower.firstName}
												className="w-12 h-12 rounded-full object-cover"
											/>
										) : (
											<span className="text-white font-bold text-sm">
												{getInitials(follower.firstName, follower.lastName)}
											</span>
										)}
									</div>
									<div className="flex-1 min-w-0 text-left">
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
											{follower.firstName} {follower.lastName}
										</p>
									</div>
								</button>
								{user && user.id !== follower.id && (
									<FollowButton
										userId={follower.id}
										isFollowing={follower.isFollowing || false}
										onFollowChange={(following) =>
											handleFollowChange(follower.id, following)
										}
										variant="outline"
										size="sm"
									/>
								)}
							</div>
						))}

						{/* Load More */}
						{hasMore && (
							<div className="flex justify-center pt-4">
								<button
									onClick={handleLoadMore}
									disabled={loadingMore}
									className="px-6 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{loadingMore ? 'Loading...' : 'Load More'}
								</button>
							</div>
						)}
					</div>
				)}
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}



