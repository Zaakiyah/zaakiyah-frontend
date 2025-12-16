import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { communityService } from '../services/communityService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import { renderContentWithHashtagsAndLinks } from '../utils/textUtils';
import BottomNavigation from '../components/layout/BottomNavigation';
import CommentBottomSheet from '../components/community/CommentBottomSheet';
import MediaViewer from '../components/community/MediaViewer';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BottomSheet from '../components/ui/BottomSheet';
import Avatar from '../components/ui/Avatar';
import { ArrowLeftIcon, EllipsisVerticalIcon, HeartIcon, ArrowUpTrayIcon, TrashIcon, PencilIcon, PlayIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
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

	const MAX_VISIBLE_MEDIA = 4; // Show up to 4 media items in grid

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

	const handleLike = async () => {
		if (!post || !id) return;
		try {
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
		}
	};

	const handleCommentAdded = () => {
		if (post) {
			setPost({ ...post, commentsCount: post.commentsCount + 1 });
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
			const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
				<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
					<div className="px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
							<div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
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
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 flex items-center justify-center">
				<EmptyState title="Post not found" description="This post may have been deleted" />
			</div>
		);
	}

	// Check ownership: use isOwner from backend (works for anonymous posts) or fallback to ID comparison
	const isOwner = post.isOwner ?? (user?.id === post.author.id);
	
	// Use backend's isFollowing as source of truth (controlled from BE)
	const userIsFollowing = post.author.isFollowing ?? false;

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
			{/* Header */}
			<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate('/community')}
							className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-900 dark:text-slate-50" />
						</button>
						{user && (
							<button
								onClick={() => setShowMenu(true)}
								className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
								aria-label="Post options"
								type="button"
							>
								<EllipsisVerticalIcon className="w-5 h-5 text-slate-900 dark:text-slate-50" />
							</button>
						)}
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-4">
				{/* Author Info */}
				<div className="flex items-start gap-3 mb-4">
					<Avatar
						avatarUrl={post.author.avatarUrl}
						firstName={post.author.firstName}
						lastName={post.author.lastName}
						size="lg"
						isVerified={post.author.isVerified}
						isAdmin={post.author.isAdmin}
					/>
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<button
								onClick={() => navigate(`/community/members/${post.author.id}`)}
								className="text-left flex-1 min-w-0"
							>
								<p className="text-[15px] font-bold text-slate-900 dark:text-slate-50 hover:underline">
									{post.author.firstName} {post.author.lastName}
								</p>
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
							{user && !isOwner && userIsFollowing === false && !post.author.isAnonymous && (
								<button
									onClick={handleToggleFollow}
									disabled={isTogglingFollow}
									className="px-3 py-1.5 text-xs font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 flex items-center gap-1.5 flex-shrink-0"
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
					<p className="text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 mb-4 whitespace-pre-wrap">
						{renderContentWithHashtags(post.content)}
					</p>
				)}

				{/* Media Grid */}
				{post.mediaUrls && post.mediaUrls.length > 0 && (
					<div className="mb-4">
						<div
							className={`grid ${getMediaGridClass(
								Math.min(post.mediaUrls.length, MAX_VISIBLE_MEDIA)
							)} gap-1 rounded-lg overflow-hidden`}
						>
							{post.mediaUrls.slice(0, MAX_VISIBLE_MEDIA).map((url, index) => {
								const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
								const remainingCount = post.mediaUrls!.length - MAX_VISIBLE_MEDIA;
								const showMoreIndicator =
									index === MAX_VISIBLE_MEDIA - 1 && remainingCount > 0;
								const mediaCount = Math.min(post.mediaUrls?.length || 0, MAX_VISIBLE_MEDIA);

								return (
									<div
										key={index}
										className={`relative ${getMediaItemClass(mediaCount, index)} cursor-pointer group overflow-hidden bg-slate-100 dark:bg-slate-700`}
										onClick={() => handleMediaClick(index)}
									>
										{isVideo ? (
											<>
												<video
													src={url}
													className={`w-full ${mediaCount === 1 ? 'h-auto' : 'h-full'} object-cover group-hover:scale-105 transition-transform duration-200`}
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
												className={`w-full ${mediaCount === 1 ? 'h-auto' : 'h-full'} object-cover group-hover:scale-105 transition-transform duration-200`}
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
				<div className="flex items-center gap-6 mb-4">
					<button
						onClick={handleLike}
						className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95"
					>
						{post.isLiked ? (
							<HeartIconSolid className="w-5 h-5 text-red-500" />
						) : (
							<HeartIcon className="w-5 h-5" />
						)}
						<span className="text-sm font-medium">{post.likesCount}</span>
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
						className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95"
					>
						<ArrowUpTrayIcon className="w-5 h-5" />
						<span className="text-sm font-medium">0</span>
					</button>
				</div>

				{/* Comments Section Header */}
				<div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between">
					<p className="text-sm text-slate-500 dark:text-slate-400">
						{post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
					</p>
					<button
						onClick={() => setShowCommentSheet(true)}
						className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
					>
						<span>All Comments</span>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				</div>
			</main>

			{/* Comment Bottom Sheet */}
			{id && (
				<CommentBottomSheet
					isOpen={showCommentSheet}
					onClose={() => setShowCommentSheet(false)}
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
			<BottomSheet
				isOpen={showMenu}
				onClose={() => setShowMenu(false)}
				title="Post Options"
			>
				<div className="space-y-1">
					{isOwner ? (
						<>
							<button
								onClick={() => {
									setShowMenu(false);
									navigate(`/community/posts/${post.id}/edit`);
								}}
								className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition-colors active:scale-95"
							>
								<PencilIcon className="w-5 h-5" />
								Edit Post
							</button>
							<button
								onClick={() => {
									setShowMenu(false);
									setShowDeleteDialog(true);
								}}
								className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 transition-colors active:scale-95"
							>
								<TrashIcon className="w-5 h-5" />
								Delete Post
							</button>
						</>
					) : (
						!post.author.isAnonymous &&
						userIsFollowing === true && (
							<button
								onClick={handleToggleFollow}
								disabled={isTogglingFollow}
								className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
							>
								<UserMinusIcon className="w-5 h-5" />
								Unfollow {post.author.firstName}
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
										title: `Post by ${post.author.isAnonymous ? 'Anonymous' : `${post.author.firstName} ${post.author.lastName}`}`,
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
						className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition-colors active:scale-95"
					>
						<ArrowUpTrayIcon className="w-5 h-5" />
						Share via
					</button>
				</div>
			</BottomSheet>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}
