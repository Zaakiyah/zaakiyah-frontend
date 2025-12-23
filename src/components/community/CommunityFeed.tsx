import { useState, useEffect, useCallback } from 'react';
import { communityService } from '../../services/communityService';
import { logger } from '../../utils/logger';
import type { Post, PostQueryParams } from '../../types/community.types';
import PostCard from './PostCard';
import CommentBottomSheet from './CommentBottomSheet';
import LoadingSkeleton from '../wealth/LoadingSkeleton';
import EmptyState from '../wealth/EmptyState';
import { 
	RectangleStackIcon, 
	FireIcon, 
	VideoCameraIcon 
} from '@heroicons/react/24/outline';

interface CommunityFeedProps {
	searchQuery?: string;
}

export default function CommunityFeed({ searchQuery = '' }: CommunityFeedProps) {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [filter, setFilter] = useState<'all' | 'trending' | 'videos'>('all');
	const [showCommentSheet, setShowCommentSheet] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
	const [likingPostId, setLikingPostId] = useState<string | null>(null);

	const fetchPosts = useCallback(
		async (pageNum: number = 1, append: boolean = false) => {
			try {
				if (pageNum === 1) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}

				const params: PostQueryParams = {
					page: pageNum,
					limit: 20,
					...(searchQuery && { search: searchQuery }),
					...(filter === 'trending' && { sort: 'trending' }),
					...(filter === 'videos' && { sort: 'videos' }),
					...(filter === 'all' && { sort: 'recent' }),
				};
				const response = await communityService.getPosts(params);

				if (response.data) {
					if (append) {
						setPosts((prev) => [...prev, ...response.data.data]);
					} else {
						setPosts(response.data.data);
					}
					setHasMore(response.data.meta.page < response.data.meta.totalPages);
				}
			} catch (error: any) {
				logger.error('Error fetching posts:', error);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[filter, searchQuery]
	);

	useEffect(() => {
		setPage(1);
		setPosts([]);
		fetchPosts(1, false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter, searchQuery]);

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchPosts(nextPage, true);
		}
	};

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
		setPosts((prev) =>
			prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
		);
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

	if (loading) {
		return (
			<div className="space-y-4">
				{/* Filter buttons skeleton */}
				<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
						/>
					))}
				</div>
				{Array.from({ length: 3 }).map((_, i) => (
					<LoadingSkeleton key={i} type="post" />
				))}
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="space-y-4">
				{/* Filter buttons */}
				<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
					<button
						onClick={() => setFilter('all')}
						className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all ${
							filter === 'all'
								? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
								: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
						}`}
					>
						<RectangleStackIcon className="w-4 h-4" />
						<span>Posts</span>
					</button>
					<button
						onClick={() => setFilter('trending')}
						className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all ${
							filter === 'trending'
								? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
								: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
						}`}
					>
						<FireIcon className="w-4 h-4" />
						<span>Trending</span>
					</button>
					<button
						onClick={() => setFilter('videos')}
						className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all ${
							filter === 'videos'
								? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
								: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
						}`}
					>
						<VideoCameraIcon className="w-4 h-4" />
						<span>Videos</span>
					</button>
				</div>
				<EmptyState
					title="No posts yet"
					description={
						filter !== 'all'
							? `No ${filter} posts found. Be the first to share!`
							: 'Be the first to share something with the community!'
					}
				/>
			</div>
		);
	}

	return (
		<div>
			{/* Filter buttons */}
			<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
				<button
					onClick={() => setFilter('all')}
					className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all ${
						filter === 'all'
							? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
							: 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
					}`}
				>
					<RectangleStackIcon className="w-4 h-4" />
					<span>Posts</span>
				</button>
				<button
					onClick={() => setFilter('trending')}
					className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all ${
						filter === 'trending'
							? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
							: 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
					}`}
				>
					<FireIcon className="w-4 h-4" />
					<span>Trending</span>
				</button>
				<button
					onClick={() => setFilter('videos')}
					className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all ${
						filter === 'videos'
							? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
							: 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
					}`}
				>
					<VideoCameraIcon className="w-4 h-4" />
					<span>Videos</span>
				</button>
			</div>

			{/* Posts */}
			<div className="space-y-0">
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

			{/* Load More */}
			{hasMore && (
				<div className="flex justify-center pt-6 pb-4">
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
	);
}
