export enum PostType {
	GENERAL = 'general',
	MILESTONE = 'milestone',
	QUESTION = 'question',
	STORY = 'story',
	INSPIRATION = 'inspiration',
}

export enum KnowledgeResourceType {
	VIDEO = 'video',
	AUDIO = 'audio',
	BOOK = 'book',
	ARTICLE = 'article',
}

export enum KnowledgeResourceCategory {
	ZAKAAT = 'zakaat',
	SADAQAH = 'sadaqah',
	WEALTH_CREATION = 'wealth-creation',
	ISLAMIC_FINANCE = 'islamic-finance',
	GIVING = 'giving',
	GENERAL = 'general',
}

export interface UserInfo {
	id: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
	createdAt?: string;
	isAnonymous: boolean;
	isFollowing?: boolean;
	followedAt?: string;
	isAdmin?: boolean;
	isVerified?: boolean;
}

export interface Post {
	id: string;
	content: string;
	type: PostType;
	mediaUrls?: string[]; // Array of media URLs
	isPublic: boolean;
	isAnonymous: boolean;
	isPinned: boolean;
	status: string;
	likesCount: number;
	commentsCount: number;
	isLiked: boolean;
	isOwner?: boolean; // Whether the current user owns this post
	author: UserInfo;
	createdAt: string;
	updatedAt: string;
}

export interface Comment {
	id: string;
	content: string;
	parentId?: string;
	likesCount: number;
	repliesCount: number;
	isLiked: boolean;
	author: UserInfo;
	post?: {
		id: string;
		content: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface KnowledgeResource {
	id: string;
	title: string;
	description?: string;
	type: KnowledgeResourceType;
	category: KnowledgeResourceCategory;
	thumbnailUrl?: string;
	resourceUrl: string;
	duration?: number;
	author?: string;
	authorBio?: string;
	language: string;
	tags: string[];
	viewCount: number;
	likeCount: number;
	isFeatured: boolean;
	isLiked: boolean;
	metadata?: Record<string, any>;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePostData {
	content: string;
	type?: PostType;
	mediaUrls?: string[];
	isAnonymous?: boolean;
}

export interface CreateCommentData {
	content: string;
	parentId?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		totalItems: number;
		currentPage: number;
		itemsPerPage: number;
		totalPages: number;
	};
}

export interface PostQueryParams {
	page?: number;
	limit?: number;
	type?: PostType;
	userId?: string;
	search?: string;
	sort?: 'trending' | 'recent' | 'videos';
}

export interface KnowledgeResourceQueryParams {
	page?: number;
	limit?: number;
	type?: KnowledgeResourceType;
	category?: KnowledgeResourceCategory;
	search?: string;
	featured?: boolean;
	language?: string;
}
