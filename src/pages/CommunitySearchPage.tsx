import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { communityService } from '../services/communityService';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import PostCard from '../components/community/PostCard';
import CommentCard from '../components/community/CommentCard';
import KnowledgeResourceCard from '../components/community/KnowledgeResourceCard';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Post, Comment, KnowledgeResource } from '../types/community.types';

type ResultType = 'all' | 'posts' | 'comments' | 'resources';

export default function CommunitySearchPage() {
	useTheme();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const query = searchParams.get('q') || '';

	const [activeTab, setActiveTab] = useState<ResultType>('all');
	const [posts, setPosts] = useState<Post[]>([]);
	const [comments, setComments] = useState<Comment[]>([]);
	const [resources, setResources] = useState<KnowledgeResource[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchInput, setSearchInput] = useState(query);

	const [postsMeta, setPostsMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
	const [commentsMeta, setCommentsMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
	const [resourcesMeta, setResourcesMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

	const fetchSearchResults = useCallback(async () => {
		if (!query.trim()) {
			setPosts([]);
			setComments([]);
			setResources([]);
			return;
		}

		try {
			setIsLoading(true);
			const response = await communityService.search(query, 1, 20);
			if (response.data) {
				setPosts(response.data.posts.data);
				setComments(response.data.comments.data);
				setResources(response.data.knowledgeResources.data);
				setPostsMeta(response.data.posts.meta);
				setCommentsMeta(response.data.comments.meta);
				setResourcesMeta(response.data.knowledgeResources.meta);
			}
		} catch (error: any) {
			logger.error('Error searching community:', error);
		} finally {
			setIsLoading(false);
		}
	}, [query]);

	useEffect(() => {
		fetchSearchResults();
	}, [fetchSearchResults]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchInput.trim()) {
			setSearchParams({ q: searchInput.trim() });
		}
	};

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

	const handleResourceLike = async (resourceId: string) => {
		try {
			const response = await communityService.toggleKnowledgeResourceLike(resourceId);
			if (response.data) {
				setResources((prev) =>
					prev.map((resource) =>
						resource.id === resourceId
							? {
									...resource,
									isLiked: response.data.liked,
									likeCount: response.data.liked
										? resource.likeCount + 1
										: resource.likeCount - 1,
							  }
							: resource
					)
				);
			}
		} catch (error: any) {
			logger.error('Error toggling resource like:', error);
		}
	};

	const getTotalResults = () => {
		return postsMeta.total + commentsMeta.total + resourcesMeta.total;
	};

	const renderResults = () => {
		if (isLoading) {
			return (
				<div className="space-y-4">
					<LoadingSkeleton type="post" count={3} />
				</div>
			);
		}

		if (!query.trim()) {
			return (
				<EmptyState
					title="Search Community"
					description="Enter a search query to find posts, comments, and knowledge resources"
				/>
			);
		}

		const showPosts = activeTab === 'all' || activeTab === 'posts';
		const showComments = activeTab === 'all' || activeTab === 'comments';
		const showResources = activeTab === 'all' || activeTab === 'resources';

		const hasResults = posts.length > 0 || comments.length > 0 || resources.length > 0;

		if (!hasResults) {
			return (
				<EmptyState
					title="No results found"
					description={`No posts, comments, or resources found for "${query}"`}
				/>
			);
		}

		return (
			<div className="space-y-6">
				{showPosts && posts.length > 0 && (
					<div>
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3">
							Posts ({postsMeta.total})
						</h2>
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
					</div>
				)}

				{showComments && comments.length > 0 && (
					<div>
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3">
							Comments ({commentsMeta.total})
						</h2>
						<div className="space-y-4">
							{comments.map((comment) => (
								<div
									key={comment.id}
									className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
								>
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
					</div>
				)}

				{showResources && resources.length > 0 && (
					<div>
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3">
							Knowledge Resources ({resourcesMeta.total})
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{resources.map((resource) => (
								<KnowledgeResourceCard
									key={resource.id}
									resource={resource}
									onLike={() => handleResourceLike(resource.id)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3 mb-3">
						<button
							onClick={() => navigate('/community')}
							className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<form onSubmit={handleSearch} className="flex-1">
							<div className="relative">
								<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
								<input
									type="text"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									placeholder="Search posts, comments, resources..."
									className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
							</div>
						</form>
					</div>

					{/* Tabs */}
					{query && (
						<div className="flex gap-1 overflow-x-auto scrollbar-hide">
							<button
								onClick={() => setActiveTab('all')}
								className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
									activeTab === 'all'
										? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
										: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
								}`}
							>
								All ({getTotalResults()})
							</button>
							<button
								onClick={() => setActiveTab('posts')}
								className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
									activeTab === 'posts'
										? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
										: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
								}`}
							>
								Posts ({postsMeta.total})
							</button>
							<button
								onClick={() => setActiveTab('comments')}
								className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
									activeTab === 'comments'
										? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
										: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
								}`}
							>
								Comments ({commentsMeta.total})
							</button>
							<button
								onClick={() => setActiveTab('resources')}
								className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
									activeTab === 'resources'
										? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
										: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
								}`}
							>
								Resources ({resourcesMeta.total})
							</button>
						</div>
					)}
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4">
				{renderResults()}
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}

