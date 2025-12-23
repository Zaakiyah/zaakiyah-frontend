import { useState, useEffect, useCallback } from 'react';
import { communityService } from '../../services/communityService';
import { logger } from '../../utils/logger';
import { useAuthStore } from '../../store/authStore';
import type {
	KnowledgeResource,
	KnowledgeResourceQueryParams,
	KnowledgeResourceType,
	KnowledgeResourceCategory,
} from '../../types/community.types';
import KnowledgeResourceCard from './KnowledgeResourceCard';
import LoadingSkeleton from '../wealth/LoadingSkeleton';
import EmptyState from '../wealth/EmptyState';
import {
	VideoCameraIcon,
	MusicalNoteIcon,
	BookOpenIcon,
	DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface KnowledgeBaseProps {
	searchQuery?: string;
}

export default function KnowledgeBase({ searchQuery: propSearchQuery = '' }: KnowledgeBaseProps) {
	const { user } = useAuthStore();
	const [resources, setResources] = useState<KnowledgeResource[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [likingResourceId, setLikingResourceId] = useState<string | null>(null);
	const [filter, setFilter] = useState<{
		type?: KnowledgeResourceType;
		category?: KnowledgeResourceCategory;
		featured?: boolean;
	}>({});
	const searchQuery = propSearchQuery;

	const fetchResources = useCallback(
		async (pageNum: number = 1, append: boolean = false) => {
			try {
				if (pageNum === 1) {
					setLoading(true);
				} else {
					setLoadingMore(true);
				}

				const params: KnowledgeResourceQueryParams = {
					page: pageNum,
					limit: 20,
					...filter,
					...(searchQuery && { search: searchQuery }),
				};

				const response = await communityService.getKnowledgeResources(params);

				if (response.data) {
					if (append) {
						setResources((prev) => [...prev, ...response.data.data]);
					} else {
						setResources(response.data.data);
					}
					setHasMore(response.data.meta.page < response.data.meta.totalPages);
				}
			} catch (error: any) {
				logger.error('Error fetching knowledge resources:', error);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[filter, searchQuery],
	);

	useEffect(() => {
		setPage(1);
		setResources([]);
		fetchResources(1, false);
	}, [filter, searchQuery]);

	const handleLoadMore = () => {
		if (!loadingMore && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchResources(nextPage, true);
		}
	};

	const handleLike = async (resourceId: string) => {
		if (!user || likingResourceId === resourceId) {
			return;
		}

		try {
			setLikingResourceId(resourceId);
			const response = await communityService.toggleKnowledgeResourceLike(resourceId);
			if (response.data) {
				setResources((prev) =>
					prev.map((resource) =>
						resource.id === resourceId
							? {
									...resource,
									isLiked: response.data.liked,
									likeCount: response.data.liked
										? resource.likeCount + 1
										: resource.likeCount - 1,
								}
							: resource
					)
				);
			}
		} catch (error: any) {
			logger.error('Error toggling resource like:', error);
		} finally {
			setLikingResourceId(null);
		}
	};

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

	const getCategoryLabel = (category: KnowledgeResourceCategory) => {
		const labels: Record<KnowledgeResourceCategory, string> = {
			zakaat: 'Zakaat',
			sadaqah: 'Sadaqah',
			'wealth-creation': 'Wealth Creation',
			'islamic-finance': 'Islamic Finance',
			giving: 'Giving',
			general: 'General',
		};
		return labels[category] || category;
	};

	if (loading) {
		return (
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<LoadingSkeleton key={i} />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="space-y-3">
				{/* Type Filter */}
				<div>
					<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
						Type
					</p>
					<div className="flex gap-2 overflow-x-auto scrollbar-hide">
						<button
							onClick={() => setFilter({ ...filter, type: undefined })}
							className={`px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
								!filter.type
									? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
									: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
							}`}
						>
							All
						</button>
						{(['video', 'audio', 'book', 'article'] as KnowledgeResourceType[]).map(
							(type) => {
								const Icon = getTypeIcon(type);
								return (
									<button
										key={type}
										onClick={() => setFilter({ ...filter, type })}
										className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
											filter.type === type
												? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
												: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
										}`}
									>
										<Icon className="w-4 h-4" />
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</button>
								);
							},
						)}
					</div>
				</div>

				{/* Category Filter */}
				<div>
					<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
						Category
					</p>
					<div className="flex gap-2 overflow-x-auto scrollbar-hide">
						<button
							onClick={() => setFilter({ ...filter, category: undefined })}
							className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
								!filter.category
									? 'bg-primary-500 text-white shadow-sm'
									: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
							}`}
						>
							All
						</button>
						{(
							[
								'zakaat',
								'sadaqah',
								'wealth-creation',
								'islamic-finance',
								'giving',
							] as KnowledgeResourceCategory[]
						).map((category) => (
							<button
								key={category}
								onClick={() => setFilter({ ...filter, category })}
								className={`px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
									filter.category === category
										? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
										: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
								}`}
							>
								{getCategoryLabel(category)}
							</button>
						))}
					</div>
				</div>

				{/* Featured Toggle */}
				<button
					onClick={() =>
						setFilter({ ...filter, featured: filter.featured ? undefined : true })
					}
					className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
						filter.featured
							? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 shadow-sm'
							: 'text-slate-600 dark:text-slate-400 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-sm'
					}`}
				>
					{filter.featured ? 'Showing Featured' : 'Show Featured Only'}
				</button>
			</div>

			{/* Resources */}
			{resources.length === 0 ? (
				<EmptyState
					title="No resources found"
					description="Try adjusting your filters or search query"
				/>
			) : (
				<div className="space-y-4">
					{resources.map((resource) => (
						<KnowledgeResourceCard
							key={resource.id}
							resource={resource}
							onLike={() => handleLike(resource.id)}
							isLiking={likingResourceId === resource.id}
						/>
					))}

					{/* Load More */}
					{hasMore && (
						<div className="flex justify-center pt-4">
							<button
								onClick={handleLoadMore}
								disabled={loadingMore}
								className="px-6 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{loadingMore ? 'Loading...' : 'Load More'}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}



