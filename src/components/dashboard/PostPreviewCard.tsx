import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, PlayIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import Avatar from '../ui/Avatar';

interface PostPreviewCardProps {
	post: {
		id: string;
		content: string;
		author?: {
			firstName?: string;
			lastName?: string;
			avatarUrl?: string;
			isVerified?: boolean;
			isAdmin?: boolean;
		};
		createdAt: string;
		mediaUrl?: string;
		mediaUrls?: string[]; // Support array of media URLs
		likesCount: number;
		commentsCount: number;
		isLiked: boolean;
	};
	onLike: (postId: string) => void;
	renderContentWithHashtags: (text: string) => React.ReactNode;
	formatDistanceToNow: (date: Date, options: { addSuffix: boolean }) => string;
}

export default function PostPreviewCard({
	post,
	onLike,
	renderContentWithHashtags,
	formatDistanceToNow,
}: PostPreviewCardProps) {
	const navigate = useNavigate();
	
	// Get media URLs - support both mediaUrl (legacy) and mediaUrls (new)
	const mediaUrls = post.mediaUrls || (post.mediaUrl ? [post.mediaUrl] : []);
	const MAX_VISIBLE_MEDIA = 4;
	
	// Check if content should be truncated (more than 2 lines or long content)
	const contentLines = post.content ? post.content.split('\n') : [];
	const shouldTruncate = contentLines.length > 2 || post.content.length > 120;

	return (
		<div
			onClick={() => navigate(`/community/posts/${post.id}`)}
			className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
		>
			<div className="flex items-start gap-2.5 mb-2">
				{post.author && 'isAnonymous' in post.author && post.author.isAnonymous ? (
					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0">
						<span className="text-sm font-bold text-white">A</span>
					</div>
				) : (
					<Avatar
						avatarUrl={post.author?.avatarUrl}
						firstName={post.author?.firstName || ''}
						lastName={post.author?.lastName || ''}
						size="sm"
						isVerified={post.author?.isVerified}
						isAdmin={post.author?.isAdmin}
					/>
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5">
						<p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
							{post.author?.firstName} {post.author?.lastName}
						</p>
						{/* Badges next to name */}
						{post.author?.isAdmin && (
							<ShieldCheckIcon className="w-3 h-3 text-amber-500 flex-shrink-0" title="Admin" />
						)}
						{post.author?.isVerified && !post.author?.isAdmin && (
							<CheckBadgeIcon className="w-3 h-3 text-primary-500 flex-shrink-0" title="Verified" />
						)}
						<span className="text-slate-400 dark:text-slate-500">•</span>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							{formatDistanceToNow(new Date(post.createdAt), {
								addSuffix: true,
							})}
						</p>
					</div>
					<div className="mb-2">
						<div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
							{renderContentWithHashtags(post.content)}
						</div>
						{shouldTruncate && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									navigate(`/community/posts/${post.id}`);
								}}
								className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline mt-1"
							>
								... more
							</button>
						)}
					</div>
					{/* Media Grid */}
					{mediaUrls.length > 0 && (
						<div className="mb-2">
							<div
								className={`grid gap-1 rounded-lg overflow-hidden ${
									mediaUrls.length === 1
										? 'grid-cols-1'
										: mediaUrls.length === 2
										? 'grid-cols-2'
										: 'grid-cols-2'
								}`}
							>
								{mediaUrls.slice(0, MAX_VISIBLE_MEDIA).map((url, index) => {
									const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
									const remainingCount = mediaUrls.length - MAX_VISIBLE_MEDIA;
									const showMoreIndicator =
										index === MAX_VISIBLE_MEDIA - 1 && remainingCount > 0;
									const mediaCount = Math.min(mediaUrls.length, MAX_VISIBLE_MEDIA);

									return (
										<div
											key={index}
											className={`relative ${
												mediaCount === 1
													? 'aspect-video'
													: 'aspect-square'
											} overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer group`}
											onClick={(e) => {
												e.stopPropagation();
												navigate(`/community/posts/${post.id}`);
											}}
										>
											{isVideo ? (
												<>
													<video
														src={url}
														className="w-full h-full object-cover"
														preload="metadata"
													/>
													<div className="absolute inset-0 flex items-center justify-center bg-black/20">
														<div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
															<PlayIcon className="w-4 h-4 text-white ml-0.5" />
														</div>
													</div>
												</>
											) : (
												<img
													src={url}
													alt={`Post media ${index + 1}`}
													className="w-full h-full object-cover"
													loading="lazy"
												/>
											)}
											{showMoreIndicator && (
												<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
													<span className="text-white text-sm font-bold">
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
					{/* Interactions */}
					<div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
						<button
							onClick={(e) => {
								e.stopPropagation();
								onLike(post.id);
							}}
							className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-error-500 transition-colors"
						>
							{post.isLiked ? (
								<HeartIconSolid className="w-4 h-4 text-error-500" />
							) : (
								<HeartIcon className="w-4 h-4" />
							)}
							<span className="text-xs font-medium">
								{post.likesCount || 0}
							</span>
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/community/posts/${post.id}`);
							}}
							className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
						>
							<ChatBubbleLeftIcon className="w-4 h-4" />
							<span className="text-xs font-medium">
								{post.commentsCount || 0}
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
