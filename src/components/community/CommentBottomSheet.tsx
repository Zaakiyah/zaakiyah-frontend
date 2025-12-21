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
import { useUserTagging, UserTaggingSuggestions } from '../../hooks/useUserTagging';
import MentionTextarea from '../ui/MentionTextarea';

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
	const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [commentFilter, setCommentFilter] = useState<'all' | 'relevant' | 'recent'>('all');
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const filterMenuRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

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
			setReplyingTo(null);
			setCommentContent('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, postId, commentFilter]);

	// Auto-focus and add mention when replying
	useEffect(() => {
		if (replyingTo && textareaRef.current) {
			const mention = `@${replyingTo.authorName} `;
			if (!commentContent.startsWith(mention)) {
				setCommentContent(mention);
			}
			setTimeout(() => {
				textareaRef.current?.focus();
				// Move cursor to end
				const length = textareaRef.current?.value.length || 0;
				textareaRef.current?.setSelectionRange(length, length);
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [replyingTo]);

	// Combined keydown handler
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Let tagging hook handle its keys first
		handleTaggingKeyDown(e);
	};

	const fetchComments = async (pageNum: number = 1, append: boolean = false) => {
		try {
			if (pageNum === 1) {
				setIsLoading(true);
			} else {
				setLoadingMore(true);
			}

			const sortParam = commentFilter === 'all' ? undefined : commentFilter;
			const response = await communityService.getPostComments(postId, pageNum, 100, sortParam);
			if (response.data) {
				const fetchedComments = response.data.data || [];
				
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
		if (!commentContent.trim() || isSubmitting) return;

		try {
			setIsSubmitting(true);
			// Shorten URLs in the content before saving
			const shortenedContent = await shortenUrlsInText(commentContent.trim());
			const data: CreateCommentData = {
				content: shortenedContent,
				parentId: replyingTo?.id,
			};
			const response = await communityService.createComment(postId, data);
			if (response.data) {
				const newComment = response.data;
				// If it's a reply, we need to update the parent comment's replies
				if (replyingTo?.id) {
					// Update the parent comment's replies count and add the reply
					setComments((prev) => {
						const updateCommentWithReply = (comments: Comment[]): Comment[] => {
							return comments.map((c) => {
								if (c.id === replyingTo.id) {
									return {
										...c,
										repliesCount: (c.repliesCount || 0) + 1,
									};
								}
								return c;
							});
						};
						return updateCommentWithReply(prev);
					});
				} else {
					// It's a top-level comment, add it to the beginning of the list
					setComments((prev) => [newComment, ...prev]);
				}
				setReplyingTo(null);
				setCommentContent('');
				onCommentAdded?.();
			}
		} catch (error: any) {
			logger.error('Error creating comment:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCommentUpdated = (updatedComment: Comment) => {
		// Only update the specific comment, not reload everything
		setComments((prev) => {
			const updateCommentInTree = (comments: Comment[]): Comment[] => {
				return comments.map((c) => {
					if (c.id === updatedComment.id) {
						return updatedComment;
					}
					return c;
				});
			};
			return updateCommentInTree(prev);
		});
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
										onReply={(commentId, authorName) => {
											if (replyingTo?.id === commentId) {
												setReplyingTo(null);
											} else {
												setReplyingTo({ id: commentId, authorName });
											}
										}}
										replyingTo={replyingTo?.id || null}
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
						{replyingTo && (
							<div className="mb-2 flex items-center justify-between px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
								<span className="text-xs text-primary-700 dark:text-primary-300">
									Replying to <span className="font-semibold">{replyingTo.authorName}</span>
								</span>
								<button
									type="button"
									onClick={() => setReplyingTo(null)}
									className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium"
								>
									Cancel
								</button>
							</div>
						)}
						<form onSubmit={handleCommentSubmit}>
							<div className="relative flex items-end gap-2">
								<div className="flex-1 relative">
									<MentionTextarea
										ref={textareaRef}
										value={commentContent}
										onChange={handleTaggingChange}
										onKeyDown={handleKeyDown}
										placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Add a comment..."}
										rows={2}
										maxLength={1000}
										className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 resize-none"
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
									type="submit"
									disabled={isSubmitting || !commentContent.trim()}
									className="p-3 sm:p-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shrink-0 min-h-[44px] sm:min-h-0"
								>
									{isSubmitting ? (
										<div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									) : (
										<PaperAirplaneIcon className="w-5 h-5 sm:w-4 sm:h-4" />
									)}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</BottomSheet>
	);
}

