import { useState, useEffect, useRef } from 'react';
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
	PaperAirplaneIcon,
	EllipsisHorizontalIcon,
	PencilIcon,
	TrashIcon,
	CheckIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Comment, CreateCommentData } from '../../types/community.types';
import ConfirmDialog from '../ui/ConfirmDialog';
import Avatar from '../ui/Avatar';

interface CommentCardProps {
	comment: Comment;
	onReply: (commentId: string) => void;
	replyingTo: boolean | string | null;
	replyContent: string;
	onReplyChange: (content: string) => void;
	onReplySubmit: () => void;
	isSubmitting: boolean;
	postId: string;
	onUpdated?: (updatedComment: Comment) => void;
	onDeleted?: (commentId: string) => void;
	onReplyAdded?: (reply: Comment, parentId: string) => void;
}

export default function CommentCard({
	comment,
	onReply,
	replyingTo,
	replyContent,
	onReplyChange,
	onReplySubmit,
	isSubmitting,
	postId,
	onUpdated,
	onDeleted,
	onReplyAdded,
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
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const isOwner = user?.id === comment.author.id;

	const formatTime = (dateString: string) => {
		try {
			const date = new Date(dateString);
			const months = [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
		try {
			const response = await communityService.toggleCommentLike(comment.id);
			if (response.data) {
				setIsLiked(response.data.liked);
				setLikesCount(response.data.liked ? likesCount + 1 : likesCount - 1);
			}
		} catch (error: any) {
			logger.error('Error toggling comment like:', error);
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

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showMenu]);

	const loadReplies = async (force: boolean = false) => {
		if (!force && (showReplies || replies.length > 0)) return;

		try {
			setIsLoadingReplies(true);
			const response = await communityService.getCommentReplies(comment.id, 1, 20);
			if (response.data) {
				setReplies(response.data.data);
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

	const handleReplySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!replyContent.trim() || !isReplyingToThis) return;

		// For nested replies (replies to replies), handle locally
		// Check if this comment has a parentId (meaning it's a nested comment)
		if (comment.parentId) {
			// This is a nested comment, handle reply creation locally
			try {
				// Shorten URLs in the content before saving
				const shortenedContent = await shortenUrlsInText(replyContent.trim());
				const data: CreateCommentData = {
					content: shortenedContent,
					parentId: comment.id, // Use this nested comment's ID as parent
				};
				const response = await communityService.createComment(postId, data);
				if (response.data) {
					// Add the new reply to the replies list and reload to get proper structure
					setReplies([]); // Clear to force reload
					await loadReplies(true); // Force reload
					// Update replies count
					onReplyAdded?.(response.data, comment.id);
					// Close reply form and clear content
					onReplyChange('');
					onReply(comment.id); // Toggle off reply form
				}
			} catch (error: any) {
				logger.error('Error creating nested reply:', error);
			}
		} else {
			// For top-level comments, use the parent's onReplySubmit
			onReplySubmit();
		}
	};

	const isReplyingToThis = replyingTo === comment.id;

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
							<p className="text-sm font-semibold text-slate-900 dark:text-slate-50 hover:underline">
								{comment.author.firstName} {comment.author.lastName}
							</p>
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
						<div className="relative">
							<button
								ref={buttonRef}
								type="button"
								onClick={() => setShowMenu(!showMenu)}
								className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
								aria-label="Comment options"
							>
								<EllipsisHorizontalIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
							</button>

							{/* Dropdown Menu */}
							<AnimatePresence>
								{showMenu && (
									<motion.div
										ref={menuRef}
										initial={{ opacity: 0, scale: 0.95, y: -5 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: -5 }}
										transition={{ duration: 0.15 }}
										className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700/50 py-1.5 z-50 overflow-hidden"
									>
										<button
											type="button"
											onClick={handleEdit}
											className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors"
										>
											<PencilIcon className="w-4 h-4" />
											Edit
										</button>
										<button
											type="button"
											onClick={() => {
												setShowMenu(false);
												setShowDeleteDialog(true);
											}}
											className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"
										>
											<TrashIcon className="w-4 h-4" />
											Delete
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}
				</div>

				{/* Comment Content */}
				{isEditing ? (
					<div className="mb-2">
						<textarea
							value={editContent}
							onChange={(e) => setEditContent(e.target.value)}
							className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
							rows={3}
							maxLength={2000}
							autoFocus
						/>
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
					<p className="text-sm leading-relaxed text-slate-900 dark:text-slate-100 mb-2 whitespace-pre-wrap">
						{renderContentWithHashtagsAndLinks(comment.content)}
					</p>
				)}

				{/* Comment Actions */}
				{!isEditing && (
					<div className="flex items-center gap-4">
						<motion.button
							type="button"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleLike}
							className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
						>
							{isLiked ? (
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
								{comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
							</button>
						)}
						{user && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onReply(comment.id);
								}}
								className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-95 cursor-pointer"
							>
								Reply
							</button>
						)}
					</div>
				)}

				{/* Reply Form */}
				<AnimatePresence>
					{isReplyingToThis && user && (
						<motion.form
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							onSubmit={handleReplySubmit}
							className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
						>
							<div className="relative">
								<input
									type="text"
									value={replyContent}
									onChange={(e) => onReplyChange(e.target.value)}
									placeholder="Write a reply..."
									maxLength={500}
									className="w-full px-4 py-2.5 pr-14 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-300 dark:focus:border-primary-600 transition-all"
									autoFocus
								/>
								<button
									type="submit"
									disabled={isSubmitting || !replyContent.trim()}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
								>
									<PaperAirplaneIcon className="w-3.5 h-3.5" />
								</button>
							</div>
						</motion.form>
					)}
				</AnimatePresence>

				{/* Replies - Recursively render nested replies */}
				<AnimatePresence>
					{showReplies && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-3 ml-9 space-y-0 border-l-2 border-slate-200 dark:border-slate-700 pl-3"
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
											replyContent={replyContent}
											onReplyChange={onReplyChange}
											onReplySubmit={onReplySubmit}
											isSubmitting={isSubmitting}
											postId={postId}
											onUpdated={(updated) => {
												setReplies((prev) =>
													prev.map((r) => (r.id === updated.id ? updated : r))
												);
												onUpdated?.(updated);
											}}
											onDeleted={(deletedId) => {
												setReplies((prev) => prev.filter((r) => r.id !== deletedId));
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
