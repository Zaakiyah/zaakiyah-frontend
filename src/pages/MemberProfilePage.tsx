import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { communityService } from '../services/communityService';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import PostCard from '../components/community/PostCard';
import CommentCard from '../components/community/CommentCard';
import CommentBottomSheet from '../components/community/CommentBottomSheet';
import FollowButton from '../components/community/FollowButton';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import Avatar from '../components/ui/Avatar';
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	UserGroupIcon,
	UserPlusIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import type { Post, Comment } from '../types/community.types';

type TabType = 'posts' | 'comments';

export default function MemberProfilePage() {
	useTheme();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [activeTab, setActiveTab] = useState<TabType>('posts');
	const [member, setMember] = useState<any>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentsCount, setCommentsCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingPosts, setIsLoadingPosts] = useState(false);
	const [isLoadingComments, setIsLoadingComments] = useState(false);
	const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });
	const [isFollowing, setIsFollowing] = useState(false);
	const [showCommentSheet, setShowCommentSheet] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [likingPostId, setLikingPostId] = useState<string | null>(null);

	const fetchMemberProfile = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoading(true);

			// Fetch user info directly (works even if user has no posts/comments)
			try {
				const userInfoResponse = await communityService.getUserInfo(id);
				if (userInfoResponse.data) {
					setMember(userInfoResponse.data);
				}
			} catch (userInfoError: any) {
				// If 404, user doesn't exist
				if (userInfoError.response?.status === 404) {
					// Will show not found - user doesn't exist
					logger.error('User not found:', userInfoError);
					return;
				}
				logger.error('Error fetching user info:', userInfoError);
			}

			// Fetch follow stats (this will work even if user has no posts/comments)
			try {
				const statsResponse = await communityService.getFollowStats(id);
				if (statsResponse.data) {
					setFollowStats(statsResponse.data);
				}
			} catch (error) {
				logger.error('Error fetching follow stats:', error);
			}

			// Check if current user is following this member
			if (user && user.id !== id) {
				try {
					const checkResponse = await communityService.isFollowing(id);
					setIsFollowing(checkResponse.data?.isFollowing || false);
				} catch (error) {
					logger.error('Error checking follow status:', error);
				}
			}
		} catch (error: any) {
			logger.error('Error fetching member profile:', error);
			// Don't navigate away, let it show not found state if member is null
		} finally {
			setIsLoading(false);
		}
	}, [id, navigate, user]);

	const fetchMemberPosts = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoadingPosts(true);
			const response = await communityService.getPosts({ userId: id });
			if (response.data) {
				setPosts(response.data.items);
			}
		} catch (error: any) {
			logger.error('Error fetching member posts:', error);
		} finally {
			setIsLoadingPosts(false);
		}
	}, [id]);

	const fetchMemberComments = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoadingComments(true);
			const response = await communityService.getUserComments(id, 1, 20);
			if (response.data) {
				setComments(response.data.items);
				setCommentsCount(
					response.data.pagination?.totalItems || response.data.items.length
				);
			}
		} catch (error: any) {
			logger.error('Error fetching member comments:', error);
		} finally {
			setIsLoadingComments(false);
		}
	}, [id]);

	useEffect(() => {
		fetchMemberProfile();
		fetchMemberPosts();
		// Also fetch comment count on mount
		if (id) {
			communityService
				.getUserComments(id, 1, 1)
				.then((response) => {
					if (response.data && response.data.pagination) {
						setCommentsCount(response.data.pagination.totalItems);
					}
				})
				.catch((error) => {
					logger.error('Error fetching comment count:', error);
				});
		}
	}, [fetchMemberProfile, fetchMemberPosts, id]);

	useEffect(() => {
		if (activeTab === 'comments') {
			fetchMemberComments();
		}
	}, [activeTab, fetchMemberComments]);

	const handlePostLike = async (postId: string) => {
		if (likingPostId === postId) return; // Prevent multiple clicks
		try {
			setLikingPostId(postId);
			const response = await communityService.togglePostLike(postId);
			if (response.data) {
				setPosts((prev) =>
					prev.map((post) =>
						post.id === postId
							? {
									...post,
									isLiked: response.data.liked,
									likesCount: response.data.liked
										? post.likesCount + 1
										: post.likesCount - 1,
							  }
							: post
					)
				);
			}
		} catch (error: any) {
			logger.error('Error toggling post like:', error);
		} finally {
			setLikingPostId(null);
		}
	};

	const handlePostDeleted = (postId: string) => {
		setPosts((prev) => prev.filter((post) => post.id !== postId));
	};

	const handlePostUpdated = (updatedPost: Post) => {
		setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
	};

	const handleCommentClick = (postId: string) => {
		setSelectedPostId(postId);
		setShowCommentSheet(true);
	};

	const handleCommentAdded = () => {
		if (selectedPostId) {
			setPosts((prev) =>
				prev.map((post) =>
					post.id === selectedPostId
						? { ...post, commentsCount: post.commentsCount + 1 }
						: post
				)
			);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
				<header className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl -z-0 pointer-events-none" />

					<div className="px-4 py-3 relative z-10">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full animate-pulse" />
						</div>
					</div>
				</header>
				<main className="px-4 py-4">
					<LoadingSkeleton type="card" count={3} />
				</main>
			</div>
		);
	}

	if (!member && !isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 flex items-center justify-center">
				<EmptyState
					title="Profile not available"
					description="This user profile could not be loaded. They may not have any posts or comments yet."
					action={{ label: 'Go back', onClick: () => navigate('/community') }}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			{/* Header */}
			<header className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl -z-0 pointer-events-none" />

				<div className="px-4 py-3 relative z-10">
					{/* Top row: Back button */}
					<div className="flex items-center mb-3">
						<button
							onClick={() => navigate(-1)}
							className="p-2 -ml-2 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
					</div>

					{/* Profile Info - Modern Layout */}
					<div className="mb-3">
						<div className="flex items-start gap-3 mb-2.5">
							<div className="relative flex-shrink-0">
								<Avatar
									avatarUrl={member.avatarUrl}
									firstName={member.firstName}
									lastName={member.lastName}
									size="xl"
									isVerified={member.isVerified}
									isAdmin={member.isAdmin}
								/>
								{/* Decorative ring */}
								<div className="absolute inset-0 rounded-full ring-2 ring-primary-500/20 dark:ring-primary-400/20 -z-10" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-1.5">
									<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
										{member.firstName} {member.lastName}
									</h2>
									{/* Badges next to name */}
									{member.isAdmin && (
										<div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20">
											<ShieldCheckIcon
												className="w-3 h-3 text-amber-600 dark:text-amber-400"
												title="Admin"
											/>
										</div>
									)}
									{member.isVerified && !member.isAdmin && (
										<div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20">
											<CheckBadgeIcon
												className="w-3 h-3 text-primary-600 dark:text-primary-400"
												title="Verified"
											/>
										</div>
									)}
								</div>
								{/* Member Since - Enhanced */}
								{member.createdAt && (
									<div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
										<div className="flex items-center justify-center w-4 h-4 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
											<CalendarDaysIcon className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" />
										</div>
										<span className="font-medium truncate">
											Member since{' '}
											{new Date(member.createdAt).toLocaleDateString(
												'en-US',
												{ month: 'short', year: 'numeric' }
											)}
										</span>
									</div>
								)}
							</div>
							{/* Follow Button - Enhanced */}
							{user && user.id !== id && (
								<div className="flex-shrink-0">
									<FollowButton
										userId={id!}
										isFollowing={isFollowing}
										onFollowChange={(following) => {
											setIsFollowing(following);
											setFollowStats((prev) => ({
												...prev,
												followersCount: following
													? prev.followersCount + 1
													: prev.followersCount - 1,
											}));
										}}
										variant="default"
										size="sm"
									/>
								</div>
							)}
						</div>
						{/* Follow Stats - Enhanced */}
						<div className="flex items-center gap-3 ml-16">
							<button
								onClick={() => navigate(`/community/members/${id}/followers`)}
								className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 transition-all active:scale-95"
							>
								<div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30">
									<UserGroupIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
								</div>
								<span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
									{followStats.followersCount}
								</span>
								<span className="text-xs text-slate-600 dark:text-slate-400">
									followers
								</span>
							</button>
							<button
								onClick={() => navigate(`/community/members/${id}/following`)}
								className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 transition-all active:scale-95"
							>
								<div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30">
									<UserPlusIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
								</div>
								<span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
									{followStats.followingCount}
								</span>
								<span className="text-xs text-slate-600 dark:text-slate-400">
									following
								</span>
							</button>
						</div>
					</div>

					{/* Tabs - Modern */}
					<div className="flex gap-2 p-1 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 mt-1">
						<button
							onClick={() => setActiveTab('posts')}
							className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${
								activeTab === 'posts'
									? 'text-primary-700 dark:text-primary-300 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 shadow-sm'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/30'
							}`}
						>
							Posts ({posts.length})
						</button>
						<button
							onClick={() => setActiveTab('comments')}
							className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${
								activeTab === 'comments'
									? 'text-primary-700 dark:text-primary-300 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 shadow-sm'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/30'
							}`}
						>
							Comments ({commentsCount})
						</button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4">
				{activeTab === 'posts' ? (
					<>
						{isLoadingPosts ? (
							<div className="space-y-4">
								<LoadingSkeleton type="card" count={3} />
							</div>
						) : posts.length === 0 ? (
							<EmptyState
								title="No posts yet"
								description={`${member.firstName} hasn't posted anything yet`}
							/>
						) : (
							<div>
								{posts.map((post) => (
									<PostCard
										key={post.id}
										post={post}
										onLike={() => handlePostLike(post.id)}
										onDeleted={() => handlePostDeleted(post.id)}
										onUpdated={handlePostUpdated}
										onCommentClick={() => handleCommentClick(post.id)}
										isLiking={likingPostId === post.id}
									/>
								))}
							</div>
						)}
					</>
				) : (
					<>
						{isLoadingComments ? (
							<div className="space-y-4">
								<LoadingSkeleton type="card" count={3} />
							</div>
						) : comments.length === 0 ? (
							<EmptyState
								title="No comments yet"
								description={`${member.firstName} hasn't commented yet`}
							/>
						) : (
							<div className="space-y-4">
								{comments.map((comment) => (
									<motion.div
										key={comment.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ type: 'spring', stiffness: 100 }}
										className="group relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
									>
										{/* Decorative gradient overlay */}
										<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl -z-0 pointer-events-none" />

										<div className="relative z-10">
											<CommentCard
												comment={comment}
												onReply={() => {}}
												replyingTo={null}
												postId={comment.post?.id || ''}
											/>
											{comment.post && (
												<div className="mt-3 pt-3 border-t-2 border-slate-200/60 dark:border-slate-700/60">
													<button
														onClick={() =>
															navigate(
																`/community/posts/${comment.post?.id}`
															)
														}
														className="group/btn flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
													>
														<span>View post</span>
														<span className="group-hover/btn:translate-x-0.5 transition-transform">
															→
														</span>
													</button>
												</div>
											)}
										</div>
									</motion.div>
								))}
							</div>
						)}
					</>
				)}
			</main>

			{/* Comment Bottom Sheet */}
			{selectedPostId && (
				<CommentBottomSheet
					isOpen={showCommentSheet}
					onClose={() => {
						setShowCommentSheet(false);
						setSelectedPostId(null);
					}}
					postId={selectedPostId}
					onCommentAdded={handleCommentAdded}
				/>
			)}

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}
