import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { communityService } from '../../services/communityService';
import { logger } from '../../utils/logger';
import { shortenUrlsInText } from '../../utils/textUtils';
import BottomSheet from '../ui/BottomSheet';
import CommentCard from './CommentCard';
import LoadingSkeleton from '../wealth/LoadingSkeleton';
import { PaperAirplaneIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Comment, CreateCommentData } from '../../types/community.types';

interface CommentBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	postId: string;
	onCommentAdded?: () => void;
}

export default function CommentBottomSheet({
	isOpen,
	onClose,
	postId,
	onCommentAdded,
}: CommentBottomSheetProps) {
	const { user } = useAuthStore();
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [commentContent, setCommentContent] = useState('');
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState('');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [commentFilter, setCommentFilter] = useState<'all' | 'relevant' | 'recent'>('all');
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const filterMenuRef = useRef<HTMLDivElement>(null);

	// Close filter menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
				setShowFilterMenu(false);
			}
		};

		if (showFilterMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showFilterMenu]);

	useEffect(() => {
		if (isOpen) {
			fetchComments(1, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, postId, commentFilter]);

	const fetchComments = async (pageNum: number = 1, append: boolean = false) => {
		try {
			if (pageNum === 1) {
				setIsLoading(true);
			} else {
				setLoadingMore(true);
			}

			const response = await communityService.getPostComments(postId, pageNum, 100); // Get more comments to allow filtering
			if (response.data) {
				let fetchedComments = response.data.data || [];
				
				// Apply filters
				if (commentFilter === 'recent') {
					// Sort by most recent (newest first)
					fetchedComments = [...fetchedComments].sort((a, b) => 
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				} else if (commentFilter === 'relevant') {
					// Sort by most liked first, then by most replies
					fetchedComments = [...fetchedComments].sort((a, b) => {
						const scoreA = a.likesCount + (a.repliesCount || 0) * 2; // Replies weighted more
						const scoreB = b.likesCount + (b.repliesCount || 0) * 2;
						return scoreB - scoreA;
					});
				}
				// 'all' filter shows comments in their default order (thread order)
				
				if (append) {
					setComments((prev) => [...prev, ...fetchedComments]);
				} else {
					setComments(fetchedComments);
				}
				setHasMore(response.data.meta.page < response.data.meta.totalPages);
			}
		} catch (error: any) {
			logger.error('Error fetching comments:', error);
		} finally {
			setIsLoading(false);
			setLoadingMore(false);
		}
	};

	const handleCommentSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentContent.trim()) return;

		try {
			setIsSubmitting(true);
			// Shorten URLs in the content before saving
			const shortenedContent = await shortenUrlsInText(commentContent.trim());
			const data: CreateCommentData = {
				content: shortenedContent,
			};
			const response = await communityService.createComment(postId, data);
			if (response.data) {
				setComments((prev) => [response.data, ...prev]);
				setCommentContent('');
				onCommentAdded?.();
			}
		} catch (error: any) {
			logger.error('Error creating comment:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReplySubmit = async (parentId: string) => {
		if (!replyContent.trim()) return;

		try {
			setIsSubmitting(true);
			// Shorten URLs in the content before saving
			const shortenedContent = await shortenUrlsInText(replyContent.trim());
			const data: CreateCommentData = {
				content: shortenedContent,
				parentId,
			};
			const response = await communityService.createComment(postId, data);
			if (response.data) {
				// Reload comments to get the updated structure with new reply in correct position
				await fetchComments(1, false);
				setReplyingTo(null);
				setReplyContent('');
			}
		} catch (error: any) {
			logger.error('Error creating reply:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCommentUpdated = (updatedComment: Comment) => {
		const updateCommentInTree = (comments: Comment[]): Comment[] => {
			return comments.map((c) => {
				if (c.id === updatedComment.id) {
					return updatedComment;
				}
				return c;
			});
		};
		setComments((prev) => updateCommentInTree(prev));
	};

	const handleCommentDeleted = (commentId: string) => {
		setComments((prev) => prev.filter((c) => c.id !== commentId));
	};

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchComments(nextPage, true);
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={onClose} title="Comments">
			<div className="flex flex-col h-full">
				{/* Filter Dropdown */}
				<div className="mb-3">
					<div className="relative" ref={filterMenuRef}>
						<button
							type="button"
							onClick={() => setShowFilterMenu(!showFilterMenu)}
							className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
						>
							<span>
								{commentFilter === 'all' ? 'All Comments' : commentFilter === 'relevant' ? 'Relevant Comments' : 'Most Recent'}
							</span>
							<ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
						</button>
						{showFilterMenu && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
								<button
									type="button"
									onClick={() => {
										setCommentFilter('all');
										setShowFilterMenu(false);
									}}
									className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
										commentFilter === 'all' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300'
									}`}
								>
									All Comments
								</button>
								<button
									type="button"
									onClick={() => {
										setCommentFilter('relevant');
										setShowFilterMenu(false);
									}}
									className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
										commentFilter === 'relevant' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300'
									}`}
								>
									Relevant Comments
								</button>
								<button
									type="button"
									onClick={() => {
										setCommentFilter('recent');
										setShowFilterMenu(false);
									}}
									className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
										commentFilter === 'recent' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300'
									}`}
								>
									Most Recent
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Comments List - Thread Style */}
				<div className="flex-1 overflow-y-auto -mx-4 px-4 mb-4">
					{isLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<LoadingSkeleton key={i} type="card" />
							))}
						</div>
					) : comments.length === 0 ? (
						<div className="py-12 text-center">
							<div className="text-4xl mb-3">💬</div>
							<p className="text-slate-500 dark:text-slate-400 font-medium">No comments yet</p>
							<p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
								Be the first to share your thoughts!
							</p>
						</div>
					) : (
						<div className="space-y-0">
							{comments.map((comment, index) => (
								<div key={comment.id} className={index > 0 ? 'border-t border-slate-100 dark:border-slate-800 pt-3' : ''}>
									<CommentCard
										comment={comment}
										onReply={(commentId) => {
											setReplyingTo(replyingTo === commentId ? null : commentId);
											setReplyContent('');
										}}
										replyingTo={replyingTo}
										replyContent={replyContent}
										onReplyChange={setReplyContent}
										onReplySubmit={() => handleReplySubmit(comment.id)}
										isSubmitting={isSubmitting}
										postId={postId}
										onUpdated={handleCommentUpdated}
										onDeleted={handleCommentDeleted}
									/>
								</div>
							))}

							{/* Load More */}
							{hasMore && (
								<div className="flex justify-center pt-2 pb-4">
									<button
										onClick={handleLoadMore}
										disabled={loadingMore}
										className="px-5 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{loadingMore ? 'Loading...' : 'Load More Comments'}
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Comment Form - Fixed at bottom */}
				{user && (
					<div className="pt-4 border-t border-slate-200 dark:border-slate-700 -mx-4 px-4 bg-white dark:bg-slate-800 pb-safe">
						<form onSubmit={handleCommentSubmit}>
							<div className="relative">
								<textarea
									value={commentContent}
									onChange={(e) => setCommentContent(e.target.value)}
									placeholder="Add a comment..."
									rows={2}
									maxLength={1000}
									className="w-full px-4 py-2.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
								/>
								<button
									type="submit"
									disabled={isSubmitting || !commentContent.trim()}
									className="absolute bottom-2.5 right-2.5 p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
								>
									<PaperAirplaneIcon className="w-4 h-4" />
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</BottomSheet>
	);
}

