import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { communityService } from '../services/communityService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import { renderContentWithHashtagsAndLinks } from '../utils/textUtils';
import CommentBottomSheet from '../components/community/CommentBottomSheet';
import CommentCard from '../components/community/CommentCard';
import MediaViewer from '../components/community/MediaViewer';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BottomSheet from '../components/ui/BottomSheet';
import Avatar from '../components/ui/Avatar';
import MentionTextarea from '../components/ui/MentionTextarea';
import { useUserTagging, UserTaggingSuggestions } from '../hooks/useUserTagging';
import { shortenUrlsInText } from '../utils/textUtils';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { Comment } from '../types/community.types';
import {
	ArrowLeftIcon,
	EllipsisVerticalIcon,
	HeartIcon,
	ArrowUpTrayIcon,
	TrashIcon,
	PencilIcon,
	PlayIcon,
	UserPlusIcon,
	UserMinusIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import type { Post } from '../types/community.types';

export default function PostDetailPage() {
	useTheme();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [post, setPost] = useState<Post | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showCommentSheet, setShowCommentSheet] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [showMediaViewer, setShowMediaViewer] = useState(false);
	const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
	const [isTogglingFollow, setIsTogglingFollow] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(false);
	const [commentContent, setCommentContent] = useState('');
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyingToAuthorName, setReplyingToAuthorName] = useState<string>('');
	const [commentFilter, setCommentFilter] = useState<'relevant' | 'recent'>('relevant');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	const MAX_VISIBLE_MEDIA = 4; // Show up to 4 media items in grid

	// User tagging hook
	const {
		handleChange: handleTaggingChange,
		handleKeyDown: handleTaggingKeyDown,
		showSuggestions,
		suggestions,
		selectedIndex,
		insertMention,
		isSearching,
	} = useUserTagging({
		value: commentContent,
		onChange: setCommentContent,
		textareaRef,
		currentUserId: user?.id,
	});

	const fetchPost = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoading(true);
			const response = await communityService.getPostById(id);
			if (response.data) {
				setPost(response.data);
			}
		} catch (error: any) {
			logger.error('Error fetching post:', error);
			navigate('/community');
		} finally {
			setIsLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		fetchPost();
	}, [fetchPost]);

	useEffect(() => {
		if (post && id) {
			fetchComments();
		}
	}, [post, id]);

	const fetchComments = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoadingComments(true);
			const response = await communityService.getPostComments(id, 1, 100, commentFilter);
			if (response.data) {
				setComments(response.data.data || []);
			}
		} catch (error: any) {
			logger.error('Error fetching comments:', error);
		} finally {
			setIsLoadingComments(false);
		}
	}, [id, commentFilter]);

	const handleLike = async () => {
		if (!post || !id || isLiking) return; // Prevent multiple clicks
		try {
			setIsLiking(true);
			const response = await communityService.togglePostLike(id);
			if (response.data) {
				setPost({
					...post,
					isLiked: response.data.liked,
					likesCount: response.data.liked ? post.likesCount + 1 : post.likesCount - 1,
				});
			}
		} catch (error: any) {
			logger.error('Error toggling post like:', error);
		} finally {
			setIsLiking(false);
		}
	};

	const handleCommentAdded = () => {
		if (post) {
			setPost({ ...post, commentsCount: post.commentsCount + 1 });
			fetchComments(); // Refresh comments list
		}
	};

	const handleReply = (commentId: string, authorName: string) => {
		setReplyingTo(commentId);
		setReplyingToAuthorName(authorName);
		setCommentContent(`@${authorName} `);
		setTimeout(() => {
			textareaRef.current?.focus();
		}, 100);
	};

	const handleSubmitComment = async () => {
		if (!commentContent.trim() || !id || isSubmittingComment || !user) return;

		try {
			setIsSubmittingComment(true);
			const shortenedContent = await shortenUrlsInText(commentContent.trim());
			const data: any = {
				content: shortenedContent,
			};

			if (replyingTo) {
				data.parentId = replyingTo;
			}

			const response = await communityService.createComment(id, data);
			if (response.data) {
				setCommentContent('');
				setReplyingTo(null);
				setReplyingToAuthorName('');
				handleCommentAdded();
			}
		} catch (error: any) {
			logger.error('Error creating comment:', error);
			alert.error('Failed to post comment. Please try again.');
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const handleCommentUpdated = (updatedComment: Comment) => {
		setComments((prev) =>
			prev.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment))
		);
	};

	const handleCommentDeleted = (commentId: string) => {
		setComments((prev) => prev.filter((comment) => comment.id !== commentId));
		if (post) {
			setPost({ ...post, commentsCount: Math.max(0, post.commentsCount - 1) });
		}
	};

	const handleToggleFollow = async () => {
		if (!user || !post) {
			alert.error('Please log in to follow users');
			return;
		}

		try {
			setIsTogglingFollow(true);
			if (userIsFollowing) {
				await communityService.unfollowUser(post.author.id);
				// Update local post state to reflect the change
				setPost({ ...post, author: { ...post.author, isFollowing: false } });
			} else {
				await communityService.followUser(post.author.id);
				// Update local post state to reflect the change
				setPost({ ...post, author: { ...post.author, isFollowing: true } });
			}
		} catch (error: any) {
			logger.error('Error toggling follow:', error);
			alert.error(error.response?.data?.message || 'Failed to update follow status');
		} finally {
			setIsTogglingFollow(false);
			setShowMenu(false);
		}
	};

	const handleDelete = async () => {
		if (!post || !id) return;
		try {
			setIsDeleting(true);
			await communityService.deletePost(post.id);
			navigate('/community');
		} catch (error: any) {
			logger.error('Error deleting post:', error);
			alert.error('Failed to delete post. Please try again.');
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	// Render content with clickable hashtags and links
	const renderContentWithHashtags = (text: string): React.ReactNode => {
		return renderContentWithHashtagsAndLinks(text);
	};

	const formatTime = (dateString: string) => {
		try {
			const date = new Date(dateString);
			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
			const month = months[date.getMonth()];
			const day = date.getDate();
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${month}, ${day} - ${hours}:${minutes}`;
		} catch {
			return 'recently';
		}
	};

	// Check if post was edited (updatedAt is significantly different from createdAt)
	const isEdited = () => {
		if (!post?.createdAt || !post?.updatedAt) return false;
		const createdAt = new Date(post.createdAt).getTime();
		const updatedAt = new Date(post.updatedAt).getTime();
		// Allow 5 seconds difference to account for database precision
		return updatedAt - createdAt > 5000;
	};

	const handleMediaClick = (index: number) => {
		setSelectedMediaIndex(index);
		setShowMediaViewer(true);
	};

	const getMediaGridClass = (mediaCount: number) => {
		if (mediaCount === 1) return 'grid-cols-1';
		if (mediaCount === 2) return 'grid-cols-2';
		if (mediaCount === 3) return 'grid-cols-2';
		return 'grid-cols-2'; // 4 or more: 2x2 grid
	};

	const getMediaItemClass = (mediaCount: number, index: number) => {
		if (mediaCount === 1) {
			return 'max-h-[500px] w-full'; // Single media: flexible height, full width
		}
		if (mediaCount === 3 && index === 2) {
			return 'aspect-square col-span-2'; // Third item spans 2 columns
		}
		return 'aspect-square'; // Default: square aspect ratio
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
				<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40">
					<div className="px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full animate-pulse" />
							<div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full animate-pulse" />
						</div>
					</div>
				</header>
				<main className="px-4 py-4">
					<LoadingSkeleton type="post" count={1} />
				</main>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 flex items-center justify-center">
				<EmptyState title="Post not found" description="This post may have been deleted" />
			</div>
		);
	}

	// Check ownership: use isOwner from backend (works for anonymous posts) or fallback to ID comparison
	const isOwner = post.isOwner ?? user?.id === post.author.id;

	// Use backend's isFollowing as source of truth (controlled from BE)
	const userIsFollowing = post.author.isFollowing ?? false;

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
			{/* Header */}
			<header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b-2 border-primary-500/20 dark:border-primary-400/20 sticky top-0 z-40 shadow-lg">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate('/community')}
							className="p-2 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10 transition-all active:scale-95"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-900 dark:text-slate-50" />
						</button>
						{user && (
							<button
								onClick={() => setShowMenu(true)}
								className="p-2 rounded-xl hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all active:scale-95"
								aria-label="Post options"
								type="button"
							>
								<EllipsisVerticalIcon className="w-6 h-6 text-slate-900 dark:text-slate-50 stroke-[2.5]" />
							</button>
						)}
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4">
				{/* Author Info */}
				<div className="flex items-start gap-3 mb-4">
					{post.author.isAnonymous ? (
						<div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0">
							<span className="text-xl font-bold text-white">A</span>
						</div>
					) : (
						<Avatar
							avatarUrl={post.author.avatarUrl}
							firstName={post.author.firstName}
							lastName={post.author.lastName}
							size="lg"
							isVerified={post.author.isVerified}
							isAdmin={post.author.isAdmin}
						/>
					)}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<button
								onClick={() => navigate(`/community/members/${post.author.id}`)}
								className="text-left flex-1 min-w-0"
							>
								<div className="flex items-center gap-1.5">
									<p className="text-[15px] font-bold text-slate-900 dark:text-slate-50 hover:underline">
										{post.author.firstName} {post.author.lastName}
									</p>
									{/* Badges next to name */}
									{post.author.isAdmin && (
										<ShieldCheckIcon
											className="w-4 h-4 text-amber-500 flex-shrink-0"
											title="Admin"
										/>
									)}
									{post.author.isVerified && !post.author.isAdmin && (
										<CheckBadgeIcon
											className="w-4 h-4 text-primary-500 flex-shrink-0"
											title="Verified"
										/>
									)}
								</div>
								<div className="flex items-center gap-1.5">
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{formatTime(post.createdAt)}
									</p>
									{isEdited() && (
										<span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
											• Edited
										</span>
									)}
								</div>
							</button>
							{/* Follow button - show when not owner, not following, and not anonymous */}
							{/* Condition controlled from BE: isFollowing field in post.author */}
							{user &&
								!isOwner &&
								userIsFollowing === false &&
								!post.author.isAnonymous && (
									<button
										onClick={handleToggleFollow}
										disabled={isTogglingFollow}
										className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 shadow-sm shadow-primary-500/20"
									>
										<UserPlusIcon className="w-3.5 h-3.5" />
										Follow
									</button>
								)}
						</div>
					</div>
				</div>

				{/* Post Content */}
				{post.content && (
					<div className="text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 mb-4 whitespace-pre-wrap">
						{renderContentWithHashtags(post.content)}
					</div>
				)}

				{/* Media Grid */}
				{post.mediaUrls && post.mediaUrls.length > 0 && (
					<div className="mb-4">
						<div
							className={`grid ${getMediaGridClass(
								Math.min(post.mediaUrls.length, MAX_VISIBLE_MEDIA)
							)} gap-1 rounded-xl overflow-hidden`}
						>
							{post.mediaUrls.slice(0, MAX_VISIBLE_MEDIA).map((url, index) => {
								const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
								const remainingCount = post.mediaUrls!.length - MAX_VISIBLE_MEDIA;
								const showMoreIndicator =
									index === MAX_VISIBLE_MEDIA - 1 && remainingCount > 0;
								const mediaCount = Math.min(
									post.mediaUrls?.length || 0,
									MAX_VISIBLE_MEDIA
								);

								return (
									<div
										key={index}
										className={`relative ${getMediaItemClass(
											mediaCount,
											index
										)} cursor-pointer group overflow-hidden bg-slate-100 dark:bg-slate-700`}
										onClick={() => handleMediaClick(index)}
									>
										{isVideo ? (
											<>
												<video
													src={url}
													className={`w-full ${
														mediaCount === 1 ? 'h-auto' : 'h-full'
													} object-cover group-hover:scale-105 transition-transform duration-200`}
													preload="metadata"
													muted
												/>
												<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-colors">
													<div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
														<PlayIcon className="w-6 h-6 text-primary-600 ml-1" />
													</div>
												</div>
											</>
										) : (
											<img
												src={url}
												alt={`Post media ${index + 1}`}
												className={`w-full ${
													mediaCount === 1 ? 'h-auto' : 'h-full'
												} object-cover group-hover:scale-105 transition-transform duration-200`}
												loading="lazy"
											/>
										)}
										{showMoreIndicator && (
											<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
												<span className="text-white text-lg font-bold">
													+{remainingCount} more
												</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Engagement Metrics */}
				<div className="flex items-center gap-6 mb-4 pt-3 border-t-2 border-slate-200/60 dark:border-slate-700/60">
					<button
						onClick={handleLike}
						disabled={isLiking}
						className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
					>
						{isLiking ? (
							<div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
						) : post.isLiked ? (
							<HeartIconSolid className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
						) : (
							<HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
						)}
						<span className="text-sm font-semibold">{post.likesCount}</span>
					</button>
					<button
						onClick={() => {
							const postUrl = `${window.location.origin}/community/posts/${post.id}`;
							if (navigator.share) {
								navigator
									.share({
										title: `Post by ${post.author.firstName} ${post.author.lastName}`,
										text: post.content.substring(0, 100),
										url: postUrl,
									})
									.catch(() => {});
							} else {
								navigator.clipboard.writeText(postUrl);
								alert.success('Link copied to clipboard');
							}
						}}
						className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95 group"
					>
						<ArrowUpTrayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
						<span className="text-sm font-semibold">0</span>
					</button>
				</div>

				{/* Comments Section */}
				<div className="border-t-2 border-slate-200/60 dark:border-slate-700/60 pt-4 mt-4">
					{/* Comments Header */}
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm font-bold text-slate-900 dark:text-slate-100">
							{post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
						</p>
						{/* Comment Filter */}
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCommentFilter('relevant')}
								className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
									commentFilter === 'relevant'
										? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-sm shadow-primary-500/20'
										: 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10'
								}`}
							>
								Most Relevant
							</button>
							<button
								onClick={() => setCommentFilter('recent')}
								className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
									commentFilter === 'recent'
										? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-sm shadow-primary-500/20'
										: 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/10'
								}`}
							>
								Most Recent
							</button>
						</div>
					</div>

					{/* Comments List */}
					{isLoadingComments ? (
						<div className="space-y-4">
							<LoadingSkeleton type="card" count={2} />
						</div>
					) : comments.length === 0 ? (
						<div className="text-center py-12 px-4">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 mb-3">
								<svg
									className="w-8 h-8 text-slate-400 dark:text-slate-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
								No comments yet. Be the first to comment!
							</p>
						</div>
					) : (
						<div className="space-y-4 mb-4">
							{comments.map((comment) => (
								<CommentCard
									key={comment.id}
									comment={comment}
									onReply={handleReply}
									replyingTo={replyingTo}
									postId={id || ''}
									onUpdated={handleCommentUpdated}
									onDeleted={handleCommentDeleted}
								/>
							))}
						</div>
					)}
				</div>
			</main>

			{/* Fixed Comment Input at Bottom */}
			{user && (
				<div 
					className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-500/20 dark:border-primary-400/20 shadow-lg z-40"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
				>
					{/* Decorative gradient overlay */}
					<div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none -z-0" />

					<div className="relative z-10">
						{replyingTo && (
							<div className="flex items-center justify-between py-2.5 px-4 mb-3 bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-primary-900/30 rounded-xl border-2 border-primary-200/60 dark:border-primary-800/60 shadow-sm">
								<span className="text-xs font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
									<svg
										className="w-3.5 h-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
										/>
									</svg>
									Replying to {replyingToAuthorName}
								</span>
								<button
									onClick={() => {
										setReplyingTo(null);
										setReplyingToAuthorName('');
										setCommentContent('');
									}}
									className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all active:scale-95 px-2 py-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40"
								>
									Cancel
								</button>
							</div>
						)}
						<div className="flex items-center gap-3">
							<div className="flex-shrink-0">
								<Avatar
									avatarUrl={user.avatarUrl}
									firstName={user.firstName}
									lastName={user.lastName}
									size="sm"
								/>
							</div>
							<div className="flex-1 relative">
								<MentionTextarea
									ref={textareaRef}
									value={commentContent}
									onChange={handleTaggingChange}
									onKeyDown={(e) => {
										handleTaggingKeyDown(e);
										if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
											handleSubmitComment();
										}
									}}
									placeholder={
										replyingTo
											? `Reply to ${replyingToAuthorName}...`
											: 'Add a comment...'
									}
									className="w-full px-4 py-3 text-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 resize-none shadow-sm hover:shadow-md transition-all"
									rows={1}
									maxLength={2000}
								/>
								<UserTaggingSuggestions
									show={showSuggestions}
									suggestions={suggestions}
									selectedIndex={selectedIndex}
									onSelect={insertMention}
									isSearching={isSearching}
									ref={suggestionsRef}
								/>
							</div>
							<button
								onClick={handleSubmitComment}
								disabled={!commentContent.trim() || isSubmittingComment}
								className="flex-shrink-0 p-3.5 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 flex items-center justify-center group"
							>
								{isSubmittingComment ? (
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Comment Bottom Sheet - For viewing all comments */}
			{id && (
				<CommentBottomSheet
					isOpen={showCommentSheet}
					onClose={() => {
						setShowCommentSheet(false);
						fetchComments(); // Refresh comments when sheet closes
					}}
					postId={id}
					onCommentAdded={handleCommentAdded}
				/>
			)}

			{/* Delete Confirmation */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDelete}
				title="Delete Post"
				message="Are you sure you want to delete this post? This action cannot be undone."
				confirmText="Delete"
				confirmVariant="danger"
				isLoading={isDeleting}
			/>

			{/* Media Viewer */}
			{post.mediaUrls && post.mediaUrls.length > 0 && (
				<MediaViewer
					isOpen={showMediaViewer}
					onClose={() => setShowMediaViewer(false)}
					mediaUrls={post.mediaUrls}
					initialIndex={selectedMediaIndex}
				/>
			)}

			{/* Post Actions Bottom Sheet */}
			<BottomSheet isOpen={showMenu} onClose={() => setShowMenu(false)} title="Post Options">
				<div className="space-y-2">
					{isOwner ? (
						<>
							<button
								onClick={() => {
									setShowMenu(false);
									navigate(`/community/posts/${post.id}/edit`);
								}}
								className="w-full px-4 py-3.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
							>
								<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
									<PencilIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
								</div>
								<span>Edit Post</span>
							</button>
							<button
								onClick={() => {
									setShowMenu(false);
									setShowDeleteDialog(true);
								}}
								className="w-full px-4 py-3.5 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/20 rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
							>
								<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 group-hover:scale-110 transition-transform">
									<TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
								</div>
								<span>Delete Post</span>
							</button>
						</>
					) : (
						!post.author.isAnonymous &&
						userIsFollowing === true && (
							<button
								onClick={handleToggleFollow}
								disabled={isTogglingFollow}
								className="w-full px-4 py-3.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 rounded-xl flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
							>
								<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 group-hover:scale-110 transition-transform">
									<UserMinusIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
								</div>
								<span>Unfollow {post.author.firstName}</span>
							</button>
						)
					)}
					{/* Share via option - available for all users */}
					<button
						onClick={() => {
							setShowMenu(false);
							const postUrl = `${window.location.origin}/community/posts/${post.id}`;
							if (navigator.share) {
								navigator
									.share({
										title: `Post by ${
											post.author.isAnonymous
												? 'Anonymous'
												: `${post.author.firstName} ${post.author.lastName}`
										}`,
										text: post.content?.substring(0, 100) || '',
										url: postUrl,
									})
									.catch(() => {
										// User cancelled or error occurred
									});
							} else {
								// Fallback: copy to clipboard
								navigator.clipboard.writeText(postUrl);
								alert.success('Link copied to clipboard');
							}
						}}
						className="w-full px-4 py-3.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
					>
						<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
							<ArrowUpTrayIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
						</div>
						<span>Share via</span>
					</button>
				</div>
			</BottomSheet>
		</div>
	);
}
