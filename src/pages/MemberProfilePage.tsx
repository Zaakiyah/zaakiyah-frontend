import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { communityService } from '../services/communityService';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import PostCard from '../components/community/PostCard';
import CommentCard from '../components/community/CommentCard';
import FollowButton from '../components/community/FollowButton';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import Avatar from '../components/ui/Avatar';
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	UserGroupIcon,
	UserPlusIcon,
} from '@heroicons/react/24/outline';
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
				setPosts(response.data.data);
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
				setComments(response.data.data);
				setCommentsCount(response.data.meta?.total || response.data.data.length);
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
			communityService.getUserComments(id, 1, 1).then((response) => {
				if (response.data && response.data.meta) {
					setCommentsCount(response.data.meta.total);
				}
			}).catch((error) => {
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
		try {
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
		}
	};

	const handlePostDeleted = (postId: string) => {
		setPosts((prev) => prev.filter((post) => post.id !== postId));
	};

	const handlePostUpdated = (updatedPost: Post) => {
		setPosts((prev) =>
			prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
		);
	};


	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
				<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
							<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
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
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 flex items-center justify-center">
				<EmptyState
					title="Profile not available"
					description="This user profile could not be loaded. They may not have any posts or comments yet."
					action={{ label: 'Go back', onClick: () => navigate('/community') }}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3 mb-4">
						<button
							onClick={() => navigate(-1)}
							className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
							Profile
						</h1>
					</div>

				{/* Profile Info - Clean Layout */}
				<div className="mb-3">
					<div className="flex items-start gap-3 mb-2">
						<Avatar
							avatarUrl={member.avatarUrl}
							firstName={member.firstName}
							lastName={member.lastName}
							size="xl"
							isVerified={member.isVerified}
							isAdmin={member.isAdmin}
						/>
						<div className="flex-1 min-w-0">
							<h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-1">
								{member.firstName} {member.lastName}
							</h2>
							{/* Member Since - Single line */}
							{member.createdAt && (
								<div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
									<CalendarDaysIcon className="w-3 h-3 flex-shrink-0" />
									<span className="truncate">
										{new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
									</span>
								</div>
							)}
						</div>
						{/* Follow Button - Separate, no overlap */}
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
					{/* Follow Stats - Separate row */}
					<div className="flex items-center gap-4 pl-14">
						<button
							onClick={() => navigate(`/community/members/${id}/followers`)}
							className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
						>
							<UserGroupIcon className="w-3.5 h-3.5" />
							<span className="font-semibold text-slate-900 dark:text-slate-50">
								{followStats.followersCount}
							</span>
							<span>followers</span>
						</button>
						<button
							onClick={() => navigate(`/community/members/${id}/following`)}
							className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
						>
							<UserPlusIcon className="w-3.5 h-3.5" />
							<span className="font-semibold text-slate-900 dark:text-slate-50">
								{followStats.followingCount}
							</span>
							<span>following</span>
						</button>
					</div>
				</div>

					{/* Tabs */}
					<div className="flex gap-1">
						<button
							onClick={() => setActiveTab('posts')}
							className={`flex-1 py-2 text-sm font-semibold transition-colors ${
								activeTab === 'posts'
									? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
							}`}
						>
							Posts ({posts.length})
						</button>
						<button
							onClick={() => setActiveTab('comments')}
							className={`flex-1 py-2 text-sm font-semibold transition-colors ${
								activeTab === 'comments'
									? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
									<div key={comment.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
										<CommentCard
											comment={comment}
											onReply={() => {}}
											replyingTo={false}
											replyContent=""
											onReplyChange={() => {}}
											onReplySubmit={() => {}}
											isSubmitting={false}
											postId={comment.post?.id || ''}
										/>
										{comment.post && (
											<div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
												<button
													onClick={() => navigate(`/community/posts/${comment.post?.id}`)}
													className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
												>
													View post →
												</button>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</>
				)}
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}

