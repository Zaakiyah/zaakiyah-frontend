import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { communityService } from '../../services/communityService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import { renderContentWithHashtagsAndLinks } from '../../utils/textUtils';
import ConfirmDialog from '../ui/ConfirmDialog';
import MediaViewer from './MediaViewer';
import BottomSheet from '../ui/BottomSheet';
import Avatar from '../ui/Avatar';
import {
	HeartIcon,
	ChatBubbleOvalLeftIcon,
	EllipsisHorizontalIcon,
	TrashIcon,
	PencilIcon,
	ArrowUpTrayIcon,
	UserPlusIcon,
	UserMinusIcon,
	PlayIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import type { Post } from '../../types/community.types';

interface PostCardProps {
	post: Post;
	onLike: () => void;
	onDeleted: () => void;
	onUpdated?: (updatedPost: Post) => void;
	onCommentClick?: () => void;
	isLiking?: boolean;
}

export default function PostCard({
	post,
	onLike,
	onDeleted,
	onUpdated,
	onCommentClick,
	isLiking = false,
}: PostCardProps) {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [showMediaViewer, setShowMediaViewer] = useState(false);
	const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
	const [isTogglingFollow, setIsTogglingFollow] = useState(false);

	// Check ownership: use isOwner from backend (works for anonymous posts) or fallback to ID comparison
	const isOwner = post.isOwner ?? user?.id === post.author.id;
	const MAX_VISIBLE_MEDIA = 4; // Show up to 4 media items in grid

	// Use backend's isFollowing as source of truth (controlled from BE)
	const userIsFollowing = post.author.isFollowing ?? false;

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await communityService.deletePost(post.id);
			onDeleted();
		} catch (error: any) {
			logger.error('Error deleting post:', error);
			alert.error('Failed to delete post. Please try again.');
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const handleToggleFollow = async () => {
		if (!user) {
			alert.error('Please log in to follow users');
			return;
		}

		try {
			setIsTogglingFollow(true);
			if (userIsFollowing) {
				await communityService.unfollowUser(post.author.id);
				// Update local post state to reflect the change
				if (onUpdated) {
					const updatedPost = { ...post, author: { ...post.author, isFollowing: false } };
					onUpdated(updatedPost);
				}
			} else {
				await communityService.followUser(post.author.id);
				// Update local post state to reflect the change
				if (onUpdated) {
					const updatedPost = { ...post, author: { ...post.author, isFollowing: true } };
					onUpdated(updatedPost);
				}
			}
		} catch (error: any) {
			logger.error('Error toggling follow:', error);
			alert.error(error.response?.data?.message || 'Failed to update follow status');
		} finally {
			setIsTogglingFollow(false);
			setShowMenu(false);
		}
	};

	const formatTime = (dateString: string) => {
		try {
			const date = new Date(dateString);
			const months = [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec',
			];
			const month = months[date.getMonth()];
			const day = date.getDate();
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${month} ${day} - ${hours}:${minutes}`;
		} catch {
			return 'recently';
		}
	};

	// Check if post was edited (updatedAt is significantly different from createdAt)
	const isEdited = () => {
		if (!post.createdAt || !post.updatedAt) return false;
		const createdAt = new Date(post.createdAt).getTime();
		const updatedAt = new Date(post.updatedAt).getTime();
		// Allow 5 seconds difference to account for database precision
		return updatedAt - createdAt > 5000;
	};

	// Render content with clickable hashtags and links
	const renderContentWithHashtags = (text: string): React.ReactNode => {
		return renderContentWithHashtagsAndLinks(text);
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

	return (
		<>
			<div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 p-5 mb-4 shadow-lg overflow-hidden">
				{/* Decorative gradient overlay */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-400/5 rounded-full blur-2xl -z-0" />
				{/* Header */}
				<div className="flex items-start gap-3 mb-4 relative z-10">
					{post.author.isAnonymous ? (
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0">
							<span className="text-base font-bold text-white">A</span>
						</div>
					) : (
						<Avatar
							avatarUrl={post.author.avatarUrl}
							firstName={post.author.firstName}
							lastName={post.author.lastName}
							size="md"
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
										<ShieldCheckIcon className="w-4 h-4 text-amber-500 flex-shrink-0" title="Admin" />
									)}
									{post.author.isVerified && !post.author.isAdmin && (
										<CheckBadgeIcon className="w-4 h-4 text-primary-500 flex-shrink-0" title="Verified" />
									)}
								</div>
								<div className="flex items-center gap-1.5 mt-0.5">
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
										className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 shadow-sm shadow-primary-500/20"
									>
										<UserPlusIcon className="w-3.5 h-3.5" />
										Follow
									</button>
								)}
						</div>
					</div>
					{user && (
						<button
							onClick={() => setShowMenu(true)}
							className="p-1.5 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all flex-shrink-0"
							aria-label="Post options"
						>
							<EllipsisHorizontalIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 stroke-[2.5]" />
						</button>
					)}
				</div>

				{/* Content */}
				{post.content && (
					<button
						onClick={() => navigate(`/community/posts/${post.id}`)}
						className="mb-3 relative z-10 text-left w-full"
					>
						<div className="text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 line-clamp-2">
							{renderContentWithHashtags(post.content)}
						</div>
						{(post.content.split('\n').length > 2 || post.content.length > 120) && (
							<span className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline mt-1 inline-block">
								... more
							</span>
						)}
					</button>
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
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleMediaClick(index);
									}}
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

				{/* Actions */}
				<div className="flex items-center justify-between pt-3 border-t-2 border-slate-200/60 dark:border-slate-700/60 relative z-10">
					<div className="flex items-center gap-6">
						<button
							onClick={onLike}
							disabled={isLiking}
							className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLiking ? (
								<div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
							) : post.isLiked ? (
								<HeartIconSolid className="w-5 h-5 text-red-500" />
							) : (
								<HeartIcon className="w-5 h-5" />
							)}
							<span className="text-sm font-medium">{post.likesCount}</span>
						</button>
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (onCommentClick) {
									onCommentClick();
								} else {
									navigate(`/community/posts/${post.id}`);
								}
							}}
							className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95"
						>
							<ChatBubbleOvalLeftIcon className="w-5 h-5" />
							<span className="text-sm font-medium">{post.commentsCount}</span>
						</button>
					</div>
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
									.catch(() => {
										// User cancelled or error occurred
									});
							} else {
								// Fallback: copy to clipboard
								navigator.clipboard.writeText(postUrl);
								alert.success('Link copied to clipboard');
							}
						}}
						className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						<ArrowUpTrayIcon className="w-5 h-5" />
					</button>
				</div>
			</div>

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
		</>
	);
}
