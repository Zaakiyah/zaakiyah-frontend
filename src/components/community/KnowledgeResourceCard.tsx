import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
	HeartIcon,
	VideoCameraIcon,
	MusicalNoteIcon,
	BookOpenIcon,
	DocumentTextIcon,
	PlayIcon,
	EyeIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { KnowledgeResource, KnowledgeResourceType } from '../../types/community.types';
import { WEBSITE_PAGES } from '../../config/website';

interface KnowledgeResourceCardProps {
	resource: KnowledgeResource;
	onLike: () => void;
	isLiking?: boolean;
}

export default function KnowledgeResourceCard({
	resource,
	onLike,
	isLiking = false,
}: KnowledgeResourceCardProps) {
	const navigate = useNavigate();

	const getTypeIcon = (type: KnowledgeResourceType) => {
		switch (type) {
			case 'video':
				return VideoCameraIcon;
			case 'audio':
				return MusicalNoteIcon;
			case 'book':
				return BookOpenIcon;
			case 'article':
				return DocumentTextIcon;
			default:
				return DocumentTextIcon;
		}
	};

	const getCategoryLabel = (category: string) => {
		const labels: Record<string, string> = {
			zakaat: 'Zakaat',
			sadaqah: 'Sadaqah',
			'wealth-creation': 'Wealth Creation',
			'islamic-finance': 'Islamic Finance',
			giving: 'Giving',
			general: 'General',
		};
		return labels[category] || category;
	};

	const formatTime = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch {
			return 'recently';
		}
	};

	const formatDuration = (minutes?: number) => {
		if (!minutes) return null;
		if (minutes < 60) return `${minutes} min`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
	};

	const TypeIcon = getTypeIcon(resource.type);
	const isVideo = resource.type === 'video';
	const isAudio = resource.type === 'audio';

	const handleResourceClick = () => {
		if (!resource.resourceUrl) return;

		if (resource.type === 'article' || resource.type === 'book') {
			// Check if resourceUrl is a full URL or relative path
			if (resource.resourceUrl.startsWith('http://') || resource.resourceUrl.startsWith('https://')) {
				// External URL - open directly
				window.open(resource.resourceUrl, '_blank', 'noopener,noreferrer');
			} else if (resource.resourceUrl.startsWith('/')) {
				// Relative path - construct blog URL
				const blogUrl = `${WEBSITE_PAGES.BLOG}${resource.resourceUrl}`;
				window.open(blogUrl, '_blank', 'noopener,noreferrer');
			} else {
				// Relative path without leading slash - add blog base
				const blogUrl = `${WEBSITE_PAGES.BLOG}/${resource.resourceUrl}`;
				window.open(blogUrl, '_blank', 'noopener,noreferrer');
			}
		} else if (resource.type === 'video' || resource.type === 'audio') {
			// For video/audio, navigate to embedded player page
			navigate(`/community/knowledge/${resource.id}`);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-200"
		>
			<div className="flex flex-col md:flex-row">
				{/* Thumbnail/Image */}
				{resource.thumbnailUrl ? (
					<div
						onClick={handleResourceClick}
						className="relative w-full md:w-56 h-56 md:h-auto bg-slate-200 dark:bg-slate-700 cursor-pointer group overflow-hidden"
					>
						<img
							src={resource.thumbnailUrl}
							alt={resource.title}
							className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
							loading="lazy"
						/>
						{(isVideo || isAudio) && (
							<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex items-center justify-center transition-colors">
								<div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
									<PlayIcon className="w-8 h-8 text-primary-600 ml-1" />
								</div>
							</div>
						)}
						{resource.isFeatured && (
							<div className="absolute top-3 left-3 px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
								⭐ Featured
							</div>
						)}
					</div>
				) : (
					<div
						onClick={handleResourceClick}
						className="relative w-full md:w-56 h-56 md:h-auto bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center cursor-pointer group"
					>
						<TypeIcon className="w-20 h-20 text-white opacity-90 group-hover:scale-110 transition-transform" />
						{resource.isFeatured && (
							<div className="absolute top-3 left-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
								⭐ Featured
							</div>
						)}
					</div>
				)}

				{/* Content */}
				<div className="flex-1 p-5 flex flex-col">
					{/* Header */}
					<div className="flex items-start justify-between gap-2 mb-3">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2">
								<TypeIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
								<span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
									{resource.type}
								</span>
								<span className="text-slate-400 dark:text-slate-500">•</span>
								<span className="text-xs font-medium text-slate-500 dark:text-slate-400">
									{getCategoryLabel(resource.category)}
								</span>
							</div>
							<h3
								onClick={handleResourceClick}
								className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
							>
								{resource.title}
							</h3>
						</div>
					</div>

					{/* Description */}
					{resource.description && (
						<p className="text-[15px] text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
							{resource.description}
						</p>
					)}

					{/* Author */}
					{resource.author && (
						<div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
							<p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
								{resource.author}
							</p>
							{resource.authorBio && (
								<p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
									{resource.authorBio}
								</p>
							)}
						</div>
					)}

					{/* Metadata */}
					<div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
						{resource.duration && (
							<span className="flex items-center gap-1">
								<ClockIcon className="w-4 h-4" />
								{formatDuration(resource.duration)}
							</span>
						)}
						<span className="flex items-center gap-1">
							<EyeIcon className="w-4 h-4" />
							{resource.viewCount} views
						</span>
						<span>{formatTime(resource.createdAt)}</span>
					</div>

					{/* Tags */}
					{resource.tags && resource.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{resource.tags.slice(0, 3).map((tag, index) => (
								<span
									key={index}
									className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
								>
									#{tag}
								</span>
							))}
							{resource.tags.length > 3 && (
								<span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
									+{resource.tags.length - 3}
								</span>
							)}
						</div>
					)}

					{/* Actions */}
					<div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								onLike();
							}}
							disabled={isLiking}
							className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-error-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLiking ? (
								<div className="w-5 h-5 border-2 border-error-500 border-t-transparent rounded-full animate-spin" />
							) : resource.isLiked ? (
								<HeartIconSolid className="w-5 h-5 text-error-500 group-hover:scale-110 transition-transform" />
							) : (
								<HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
							)}
							<span className="text-sm font-semibold">{resource.likeCount}</span>
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleResourceClick}
							className="px-5 py-2.5 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors shadow-sm hover:shadow-md"
						>
							{resource.type === 'article' || resource.type === 'book'
								? 'Read'
								: resource.type === 'video'
									? 'Watch'
									: 'Listen'}
						</motion.button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

