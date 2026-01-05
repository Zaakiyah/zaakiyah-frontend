import { useState, useEffect } from 'react';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { communityService } from '../../services/communityService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PostLikesModalProps {
	isOpen: boolean;
	onClose: () => void;
	postId: string;
	likesCount: number;
}

interface UserLike {
	id: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	isVerified?: boolean;
	likedAt: string;
}

export default function PostLikesModal({
	isOpen,
	onClose,
	postId,
	likesCount,
}: PostLikesModalProps) {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [users, setUsers] = useState<UserLike[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && postId) {
			fetchLikes();
		} else {
			// Reset when modal closes
			setUsers([]);
			setPage(1);
			setHasMore(true);
			setError(null);
		}
	}, [isOpen, postId]);

	const fetchLikes = async (pageNum: number = 1) => {
		if (isLoading) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await communityService.getPostLikes(postId, pageNum, 50);
			if (response.data) {
				const newUsers = response.data.items;
				if (pageNum === 1) {
					setUsers(newUsers);
				} else {
					setUsers((prev) => [...prev, ...newUsers]);
				}
				setHasMore(pageNum < response.data.pagination.totalPages);
				setPage(pageNum);
			}
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load users');
			console.error('Error fetching post likes:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLoadMore = () => {
		if (!isLoading && hasMore) {
			fetchLikes(page + 1);
		}
	};

	const handleUserClick = (userId: string) => {
		if (userId === user?.id) {
			navigate('/profile');
		} else {
			navigate(`/community/members/${userId}`);
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
								<div className="flex items-center gap-3">
									<HeartIconSolid className="w-6 h-6 text-red-500" />
									<div>
										<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
											Likes
										</h2>
										<p className="text-sm text-slate-500 dark:text-slate-400">
											{likesCount} {likesCount === 1 ? 'like' : 'likes'}
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
								>
									<XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
								</button>
							</div>

							{/* Content */}
							<div className="flex-1 overflow-y-auto">
								{error ? (
									<div className="p-8 text-center">
										<p className="text-red-600 dark:text-red-400">{error}</p>
										<button
											onClick={() => fetchLikes(1)}
											className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
										>
											Try Again
										</button>
									</div>
								) : users.length === 0 && !isLoading ? (
									<div className="p-8 text-center">
										<HeartIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
										<p className="text-slate-500 dark:text-slate-400">
											No likes yet
										</p>
									</div>
								) : (
									<div className="divide-y divide-slate-200 dark:divide-slate-700">
										{users.map((userLike) => (
											<button
												key={userLike.id}
												onClick={() => handleUserClick(userLike.id)}
												className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
											>
												<div className="relative flex-shrink-0">
													{userLike.avatarUrl ? (
														<img
															src={userLike.avatarUrl}
															alt={`${userLike.firstName} ${userLike.lastName}`}
															className="w-12 h-12 rounded-full object-cover"
														/>
													) : (
														<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
															{userLike.firstName
																.charAt(0)
																.toUpperCase()}
															{userLike.lastName
																.charAt(0)
																.toUpperCase()}
														</div>
													)}
													{userLike.isVerified && (
														<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
															<svg
																className="w-3 h-3 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
															{userLike.firstName} {userLike.lastName}
														</p>
													</div>
													<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
														{formatDistanceToNow(
															new Date(userLike.likedAt),
															{ addSuffix: true }
														)}
													</p>
												</div>
											</button>
										))}
									</div>
								)}

								{/* Load More */}
								{hasMore && !isLoading && (
									<div className="p-4 text-center">
										<button
											onClick={handleLoadMore}
											className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
										>
											Load More
										</button>
									</div>
								)}

								{/* Loading */}
								{isLoading && (
									<div className="p-8 text-center">
										<div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
