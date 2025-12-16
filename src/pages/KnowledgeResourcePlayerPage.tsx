import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { communityService } from '../services/communityService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import BottomNavigation from '../components/layout/BottomNavigation';
import LoadingSkeleton from '../components/wealth/LoadingSkeleton';
import EmptyState from '../components/wealth/EmptyState';
import { ArrowLeftIcon, HeartIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { KnowledgeResource } from '../types/community.types';

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
function getYouTubeVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/youtube\.com\/watch\?.*&v=([^&\n?#]+)/,
	];
	
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}
	
	return null;
}

/**
 * Extract Vimeo video ID from Vimeo URL
 */
function getVimeoVideoId(url: string): string | null {
	const patterns = [
		/(?:vimeo\.com\/)(\d+)/,
		/(?:vimeo\.com\/video\/)(\d+)/,
	];
	
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}
	
	return null;
}

/**
 * Check if URL is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
	return /youtube\.com|youtu\.be/.test(url);
}

/**
 * Check if URL is a Vimeo URL
 */
function isVimeoUrl(url: string): boolean {
	return /vimeo\.com/.test(url);
}

/**
 * Check if URL is an audio file
 */
function isAudioFile(url: string): boolean {
	return /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(url);
}

export default function KnowledgeResourcePlayerPage() {
	useTheme();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [resource, setResource] = useState<KnowledgeResource | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLiked, setIsLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const hasFetchedRef = useRef<string | null>(null); // Track which resource ID we've already fetched

	useEffect(() => {
		// Reset fetch tracking when resource ID changes
		if (hasFetchedRef.current !== id) {
			hasFetchedRef.current = null;
		}

		const fetchResource = async () => {
			if (!id) return;

			// Prevent duplicate fetches (e.g., from React StrictMode double-invocation)
			if (hasFetchedRef.current === id) {
				return;
			}

			try {
				setIsLoading(true);
				hasFetchedRef.current = id; // Mark as fetched before the API call
				const response = await communityService.getKnowledgeResourceById(id);
				if (response.data) {
					setResource(response.data);
					setIsLiked(response.data.isLiked);
					setLikeCount(response.data.likeCount);
				}
			} catch (error: any) {
				logger.error('Error fetching knowledge resource:', error);
				alert.error(error.response?.data?.message || 'Failed to load resource');
				navigate('/community');
				hasFetchedRef.current = null; // Reset on error so it can retry
			} finally {
				setIsLoading(false);
			}
		};

		fetchResource();
	}, [id, navigate]);

	const handleLike = async () => {
		if (!id) return;

		try {
			const response = await communityService.toggleKnowledgeResourceLike(id);
			if (response.data) {
				setIsLiked(response.data.liked);
				setLikeCount(response.data.liked ? likeCount + 1 : likeCount - 1);
			}
		} catch (error: any) {
			logger.error('Error toggling resource like:', error);
			alert.error('Failed to update like');
		}
	};

	const formatDuration = (minutes?: number) => {
		if (!minutes) return null;
		if (minutes < 60) return `${minutes} min`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
	};

	const renderPlayer = () => {
		if (!resource?.resourceUrl) return null;

		const url = resource.resourceUrl;

		// YouTube video
		if (isYouTubeUrl(url)) {
			const videoId = getYouTubeVideoId(url);
			if (videoId) {
				return (
					<div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
						<iframe
							src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
							title={resource.title}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="w-full h-full"
						/>
					</div>
				);
			}
		}

		// Vimeo video
		if (isVimeoUrl(url)) {
			const videoId = getVimeoVideoId(url);
			if (videoId) {
				return (
					<div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
						<iframe
							src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
							title={resource.title}
							allow="autoplay; fullscreen; picture-in-picture"
							allowFullScreen
							className="w-full h-full"
						/>
					</div>
				);
			}
		}

		// Audio file
		if (resource.type === 'audio' || isAudioFile(url)) {
			return (
				<div className="w-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-8">
					<div className="max-w-md mx-auto text-center">
						<div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
							<svg
								className="w-16 h-16 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
							</svg>
						</div>
						<audio
							controls
							className="w-full"
							src={url}
						>
							Your browser does not support the audio element.
						</audio>
					</div>
				</div>
			);
		}

		// Generic video file (mp4, webm, etc.)
		if (resource.type === 'video') {
			return (
				<div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
					<video
						controls
						className="w-full h-full"
						src={url}
					>
						Your browser does not support the video tag.
					</video>
				</div>
			);
		}

		// Fallback - open URL
		return (
			<div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
				>
					Open Resource
				</a>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
				<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
							<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
						</div>
					</div>
				</header>
				<main className="px-4 py-4">
					<LoadingSkeleton type="card" count={3} />
				</main>
			</div>
		);
	}

	if (!resource) {
		return (
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 flex items-center justify-center">
				<EmptyState
					title="Resource not found"
					description="This resource may have been removed or doesn't exist"
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
			{/* Header */}
			<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate('/community')}
							className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<div className="flex-1 min-w-0">
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
								{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
							</h1>
						</div>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-5 space-y-5">
				{/* Player */}
				{renderPlayer()}

				{/* Resource Info */}
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
					<h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
						{resource.title}
					</h2>

					{resource.description && (
						<p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
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
								<p className="text-xs text-slate-500 dark:text-slate-400">
									{resource.authorBio}
								</p>
							)}
						</div>
					)}

					{/* Metadata */}
					<div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
						{resource.duration && (
							<span className="flex items-center gap-1.5">
								<ClockIcon className="w-4 h-4" />
								{formatDuration(resource.duration)}
							</span>
						)}
						<span className="flex items-center gap-1.5">
							<EyeIcon className="w-4 h-4" />
							{resource.viewCount} views
						</span>
					</div>

					{/* Tags */}
					{resource.tags && resource.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{resource.tags.map((tag, index) => (
								<span
									key={index}
									className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
								>
									#{tag}
								</span>
							))}
						</div>
					)}

					{/* Actions */}
					<button
						onClick={handleLike}
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
					>
						{isLiked ? (
							<HeartIconSolid className="w-5 h-5 text-error-500" />
						) : (
							<HeartIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
						)}
						<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
							{likeCount}
						</span>
					</button>
				</div>
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation />
		</div>
	);
}







