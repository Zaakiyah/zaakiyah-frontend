import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { communityService } from '../../services/communityService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import { renderContentWithHashtagsAndLinks, shortenUrlsInText } from '../../utils/textUtils';
import {
	HeartIcon,
	ChatBubbleOvalLeftIcon,
	EllipsisHorizontalIcon,
	PencilIcon,
	TrashIcon,
	CheckIcon,
	XMarkIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import type { Comment } from '../../types/community.types';
import ConfirmDialog from '../ui/ConfirmDialog';
import BottomSheet from '../ui/BottomSheet';
import Avatar from '../ui/Avatar';
import MentionTextarea from '../ui/MentionTextarea';
import { useUserTagging, UserTaggingSuggestions } from '../../hooks/useUserTagging';

interface CommentCardProps {
	comment: Comment;
	onReply: (commentId: string, authorName: string) => void;
	replyingTo: string | null;
	postId: string;
	onUpdated?: (updatedComment: Comment) => void;
	onDeleted?: (commentId: string) => void;
}

export default function CommentCard({
	comment,
	onReply,
	replyingTo,
	postId,
	onUpdated,
	onDeleted,
}: CommentCardProps) {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [replies, setReplies] = useState<Comment[]>([]);
	const [showReplies, setShowReplies] = useState(false);
	const [isLoadingReplies, setIsLoadingReplies] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLiked, setIsLiked] = useState(comment.isLiked);
	const [likesCount, setLikesCount] = useState(comment.likesCount);
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [isUpdating, setIsUpdating] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const editTextareaRef = useRef<HTMLTextAreaElement>(null);
	const editSuggestionsRef = useRef<HTMLDivElement>(null);

	// User tagging hook for edit mode
	const {
		handleChange: handleEditTaggingChange,
		handleKeyDown: handleEditTaggingKeyDown,
		showSuggestions: showEditSuggestions,
		suggestions: editSuggestions,
		selectedIndex: editSelectedIndex,
		insertMention: insertEditMention,
		isSearching: isEditSearching,
	} = useUserTagging({
		value: editContent,
		onChange: setEditContent,
		textareaRef: editTextareaRef,
		currentUserId: user?.id,
	});

	const isOwner = user?.id === comment.author.id;

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

	// Check if comment was edited (updatedAt is significantly different from createdAt)
	const isEdited = () => {
		if (!comment.createdAt || !comment.updatedAt) return false;
		const createdAt = new Date(comment.createdAt).getTime();
		const updatedAt = new Date(comment.updatedAt).getTime();
		// Allow 5 seconds difference to account for database precision
		return updatedAt - createdAt > 5000;
	};

	const handleLike = async () => {
		if (isLiking) return; // Prevent multiple clicks
		try {
			setIsLiking(true);
			const response = await communityService.toggleCommentLike(comment.id);
			if (response.data) {
				setIsLiked(response.data.liked);
				setLikesCount(response.data.liked ? likesCount + 1 : likesCount - 1);
			}
		} catch (error: any) {
			logger.error('Error toggling comment like:', error);
		} finally {
			setIsLiking(false);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
		setEditContent(comment.content);
		setShowMenu(false);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditContent(comment.content);
	};

	const handleSaveEdit = async () => {
		if (!editContent.trim()) {
			alert.error('Comment cannot be empty');
			return;
		}

		try {
			setIsUpdating(true);
			// Shorten URLs in the content before saving
			const shortenedContent = await shortenUrlsInText(editContent.trim());
			const response = await communityService.updateComment(comment.id, {
				content: shortenedContent,
			});
			if (response.data) {
				onUpdated?.(response.data);
				setIsEditing(false);
			}
		} catch (error: any) {
			logger.error('Error updating comment:', error);
			alert.error('Failed to update comment. Please try again.');
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			await communityService.deleteComment(comment.id);
			onDeleted?.(comment.id);
		} catch (error: any) {
			logger.error('Error deleting comment:', error);
			alert.error('Failed to delete comment. Please try again.');
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const loadReplies = async (force: boolean = false) => {
		if (!force && (showReplies || replies.length > 0)) return;

		try {
			setIsLoadingReplies(true);
			const response = await communityService.getCommentReplies(comment.id, 1, 20);
			if (response.data) {
				setReplies(response.data.items);
			}
		} catch (error: any) {
			logger.error('Error fetching replies:', error);
		} finally {
			setIsLoadingReplies(false);
		}
	};

	const handleShowReplies = () => {
		if (!showReplies) {
			loadReplies();
		}
		setShowReplies(!showReplies);
	};

	const authorName = `${comment.author.firstName} ${comment.author.lastName}`;

	return (
		<>
			<div className="py-3">
				{/* Comment Header */}
				<div className="flex items-start gap-2.5 mb-2">
					<Avatar
						avatarUrl={comment.author.avatarUrl}
						firstName={comment.author.firstName}
						lastName={comment.author.lastName}
						size="xs"
						isVerified={comment.author.isVerified}
						isAdmin={comment.author.isAdmin}
					/>
					<div className="flex-1 min-w-0">
						<button
							onClick={() => navigate(`/community/members/${comment.author.id}`)}
							className="text-left w-full"
						>
							<div className="flex items-center gap-1.5">
								<p className="text-sm font-semibold text-slate-900 dark:text-slate-50 hover:underline">
									{comment.author.firstName} {comment.author.lastName}
								</p>
								{/* Badges next to name */}
								{comment.author.isAdmin && (
									<ShieldCheckIcon
										className="w-4 h-4 text-amber-500 flex-shrink-0"
										title="Admin"
									/>
								)}
								{comment.author.isVerified && !comment.author.isAdmin && (
									<CheckBadgeIcon
										className="w-4 h-4 text-primary-500 flex-shrink-0"
										title="Verified"
									/>
								)}
							</div>
							<div className="flex items-center gap-1.5 mt-0.5">
								<p className="text-xs text-slate-500 dark:text-slate-400">
									{formatTime(comment.createdAt)}
								</p>
								{isEdited() && (
									<span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
										• Edited
									</span>
								)}
							</div>
						</button>
					</div>
					{isOwner && (
						<button
							type="button"
							onClick={() => setShowMenu(true)}
							className="p-1.5 rounded-xl hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all active:scale-95"
							aria-label="Comment options"
						>
							<EllipsisHorizontalIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 stroke-[2.5]" />
						</button>
					)}
				</div>

				{/* Comment Content */}
				{isEditing ? (
					<div className="mb-2">
						<div className="relative">
							<MentionTextarea
								ref={editTextareaRef}
								value={editContent}
								onChange={handleEditTaggingChange}
								onKeyDown={handleEditTaggingKeyDown}
								className="w-full px-3 py-2 text-sm bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 resize-none shadow-sm"
								rows={3}
								maxLength={2000}
								autoFocus
							/>
							<UserTaggingSuggestions
								show={showEditSuggestions}
								suggestions={editSuggestions}
								selectedIndex={editSelectedIndex}
								onSelect={insertEditMention}
								isSearching={isEditSearching}
								ref={editSuggestionsRef}
							/>
						</div>
						<div className="flex items-center gap-2 mt-2">
							<button
								type="button"
								onClick={handleSaveEdit}
								disabled={isUpdating || !editContent.trim()}
								className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<CheckIcon className="w-3.5 h-3.5" />
								Save
							</button>
							<button
								type="button"
								onClick={handleCancelEdit}
								disabled={isUpdating}
								className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<XMarkIcon className="w-3.5 h-3.5" />
								Cancel
							</button>
						</div>
					</div>
				) : (
					<div className="text-sm leading-relaxed text-slate-900 dark:text-slate-100 mb-2 whitespace-pre-wrap">
						{renderContentWithHashtagsAndLinks(comment.content)}
					</div>
				)}

				{/* Comment Actions */}
				{!isEditing && (
					<div className="flex items-center gap-4">
						<motion.button
							type="button"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleLike}
							disabled={isLiking}
							className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLiking ? (
								<div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
							) : isLiked ? (
								<HeartIconSolid className="w-4 h-4 text-red-500" />
							) : (
								<HeartIcon className="w-4 h-4" />
							)}
							<span className="text-xs font-semibold">{likesCount}</span>
						</motion.button>
						{user && comment.repliesCount > 0 && (
							<button
								type="button"
								onClick={handleShowReplies}
								className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all text-xs font-semibold active:scale-95 cursor-pointer"
							>
								<ChatBubbleOvalLeftIcon className="w-4 h-4" />
								{comment.repliesCount}{' '}
								{comment.repliesCount === 1 ? 'reply' : 'replies'}
							</button>
						)}
						{user && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onReply(comment.id, authorName);
								}}
								className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95 cursor-pointer"
							>
								Reply
							</button>
						)}
					</div>
				)}

				{/* Replies - Recursively render nested replies */}
				<AnimatePresence>
					{showReplies && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-3 ml-9 space-y-0 border-l-2 border-slate-200/60 dark:border-slate-700/60 pl-3"
						>
							{isLoadingReplies ? (
								<div className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-2">
									Loading replies...
								</div>
							) : replies.length === 0 ? (
								<div className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">
									No replies yet
								</div>
							) : (
								replies.map((reply) => (
									<div key={reply.id} className="border-l-0">
										<CommentCard
											comment={reply}
											onReply={onReply}
											replyingTo={replyingTo}
											postId={postId}
											onUpdated={(updated) => {
												setReplies((prev) =>
													prev.map((r) =>
														r.id === updated.id ? updated : r
													)
												);
												onUpdated?.(updated);
											}}
											onDeleted={(deletedId) => {
												setReplies((prev) =>
													prev.filter((r) => r.id !== deletedId)
												);
												onDeleted?.(deletedId);
											}}
										/>
									</div>
								))
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Comment Options Bottom Sheet */}
			<BottomSheet
				isOpen={showMenu}
				onClose={() => setShowMenu(false)}
				title="Comment Options"
			>
				<div className="space-y-2">
					<button
						type="button"
						onClick={() => {
							setShowMenu(false);
							handleEdit();
						}}
						className="w-full px-4 py-3.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/20 rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
					>
						<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
							<PencilIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
						</div>
						<span>Edit Comment</span>
					</button>
					<button
						type="button"
						onClick={() => {
							setShowMenu(false);
							setShowDeleteDialog(true);
						}}
						className="w-full px-4 py-3.5 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/20 rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
					>
						<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 group-hover:scale-110 transition-transform">
							<TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
						</div>
						<span>Delete Comment</span>
					</button>
				</div>
			</BottomSheet>

			{/* Delete Confirmation */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDelete}
				title="Delete Comment"
				message="Are you sure you want to delete this comment? This action cannot be undone."
				confirmText="Delete"
				confirmVariant="danger"
				isLoading={isDeleting}
			/>
		</>
	);
}
