import api from '../lib/api';
import { logger } from '../utils/logger';
import type {
	Post,
	Comment,
	KnowledgeResource,
	CreatePostData,
	CreateCommentData,
	PaginatedResponse,
	PostQueryParams,
	KnowledgeResourceQueryParams,
	UserInfo,
} from '../types/community.types';
import type { ApiResponse } from '../types/wealth.types';

export const communityService = {
	/**
	 * Upload a single media file
	 */
	async uploadMedia(file: File): Promise<ApiResponse<{ url: string }>> {
		try {
			const formData = new FormData();
			formData.append('file', file);
			const response = await api.post<ApiResponse<{ url: string }>>(
				'/media/upload',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error uploading media:', error);
			throw error;
		}
	},

	/**
	 * Upload multiple media files
	 */
	async uploadMultipleMedia(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
		try {
			const formData = new FormData();
			files.forEach((file) => {
				formData.append('files', file);
			});
			const response = await api.post<ApiResponse<{ urls: string[] }>>(
				'/media/upload/multiple',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error uploading media files:', error);
			throw error;
		}
	},

	/**
	 * Delete a media file from Cloudinary
	 */
	async deleteMedia(url: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
		try {
			const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
				'/media/delete',
				{
					data: { url },
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error deleting media:', error);
			throw error;
		}
	},

	/**
	 * Create a new post
	 */
	async createPost(data: CreatePostData | FormData): Promise<ApiResponse<Post>> {
		try {
			const response = await api.post<ApiResponse<Post>>('/posts', data);
			return response.data;
		} catch (error: any) {
			logger.error('Error creating post:', error);
			throw error;
		}
	},

	/**
	 * Get paginated posts
	 */
	async getPosts(params?: PostQueryParams): Promise<ApiResponse<PaginatedResponse<Post>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<Post>>>('/posts', {
				params,
			});
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching posts:', error);
			throw error;
		}
	},

	/**
	 * Get single post by ID
	 */
	async getPostById(postId: string): Promise<ApiResponse<Post>> {
		try {
			const response = await api.get<ApiResponse<Post>>(`/posts/${postId}`);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching post:', error);
			throw error;
		}
	},

	/**
	 * Update a post
	 */
	async updatePost(
		postId: string,
		data: Partial<CreatePostData> | FormData
	): Promise<ApiResponse<Post>> {
		try {
			const response = await api.put<ApiResponse<Post>>(`/posts/${postId}`, data);
			return response.data;
		} catch (error: any) {
			logger.error('Error updating post:', error);
			throw error;
		}
	},

	/**
	 * Delete a post
	 */
	async deletePost(postId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
		try {
			const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
				`/posts/${postId}`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error deleting post:', error);
			throw error;
		}
	},

	/**
	 * Toggle like on a post
	 */
	async togglePostLike(postId: string): Promise<ApiResponse<{ liked: boolean }>> {
		try {
			const response = await api.post<ApiResponse<{ liked: boolean }>>(
				`/posts/${postId}/like`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error toggling post like:', error);
			throw error;
		}
	},

	/**
	 * Create a comment
	 */
	async createComment(postId: string, data: CreateCommentData): Promise<ApiResponse<Comment>> {
		try {
			const response = await api.post<ApiResponse<Comment>>(
				`/comments/posts/${postId}`,
				data
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error creating comment:', error);
			throw error;
		}
	},

	/**
	 * Get comments for a post
	 */
	async getPostComments(
		postId: string,
		page: number = 1,
		limit: number = 20
	): Promise<ApiResponse<PaginatedResponse<Comment>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
				`/comments/posts/${postId}`,
				{
					params: { page, limit },
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching comments:', error);
			throw error;
		}
	},

	/**
	 * Get comments by user ID
	 */
	async getUserComments(
		userId: string,
		page: number = 1,
		limit: number = 20
	): Promise<ApiResponse<PaginatedResponse<Comment>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
				`/comments/users/${userId}`,
				{
					params: { page, limit },
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching user comments:', error);
			throw error;
		}
	},

	/**
	 * Get replies to a comment
	 */
	async getCommentReplies(
		commentId: string,
		page: number = 1,
		limit: number = 20
	): Promise<ApiResponse<PaginatedResponse<Comment>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
				`/comments/${commentId}/replies`,
				{
					params: { page, limit },
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching comment replies:', error);
			throw error;
		}
	},

	/**
	 * Update a comment
	 */
	async updateComment(
		commentId: string,
		data: { content: string }
	): Promise<ApiResponse<Comment>> {
		try {
			const response = await api.put<ApiResponse<Comment>>(`/comments/${commentId}`, data);
			return response.data;
		} catch (error: any) {
			logger.error('Error updating comment:', error);
			throw error;
		}
	},

	/**
	 * Delete a comment
	 */
	async deleteComment(
		commentId: string
	): Promise<ApiResponse<{ success: boolean; message: string }>> {
		try {
			const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
				`/comments/${commentId}`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error deleting comment:', error);
			throw error;
		}
	},

	/**
	 * Toggle like on a comment
	 */
	async toggleCommentLike(commentId: string): Promise<ApiResponse<{ liked: boolean }>> {
		try {
			const response = await api.post<ApiResponse<{ liked: boolean }>>(
				`/comments/${commentId}/like`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error toggling comment like:', error);
			throw error;
		}
	},

	/**
	 * Get paginated knowledge resources
	 */
	async getKnowledgeResources(
		params?: KnowledgeResourceQueryParams
	): Promise<ApiResponse<PaginatedResponse<KnowledgeResource>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<KnowledgeResource>>>(
				'/community/knowledge',
				{
					params,
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching knowledge resources:', error);
			throw error;
		}
	},

	/**
	 * Get single knowledge resource by ID
	 */
	async getKnowledgeResourceById(resourceId: string): Promise<ApiResponse<KnowledgeResource>> {
		try {
			const response = await api.get<ApiResponse<KnowledgeResource>>(
				`/community/knowledge/${resourceId}`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching knowledge resource:', error);
			throw error;
		}
	},

	/**
	 * Toggle like on a knowledge resource
	 */
	async toggleKnowledgeResourceLike(
		resourceId: string
	): Promise<ApiResponse<{ liked: boolean }>> {
		try {
			const response = await api.post<ApiResponse<{ liked: boolean }>>(
				`/community/knowledge/${resourceId}/like`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error toggling knowledge resource like:', error);
			throw error;
		}
	},

	/**
	 * Follow a user
	 */
	async followUser(userId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
		try {
			const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
				`/users/${userId}/follow`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error following user:', error);
			throw error;
		}
	},

	/**
	 * Unfollow a user
	 */
	async unfollowUser(
		userId: string
	): Promise<ApiResponse<{ success: boolean; message: string }>> {
		try {
			const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
				`/users/${userId}/follow`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error unfollowing user:', error);
			throw error;
		}
	},

	/**
	 * Get followers of a user
	 */
	async getFollowers(
		userId: string,
		page: number = 1,
		limit: number = 20
	): Promise<ApiResponse<PaginatedResponse<UserInfo>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<UserInfo>>>(
				`/users/${userId}/followers`,
				{
					params: { page, limit },
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching followers:', error);
			throw error;
		}
	},

	/**
	 * Get users that a user is following
	 */
	async getFollowing(
		userId: string,
		page: number = 1,
		limit: number = 20
	): Promise<ApiResponse<PaginatedResponse<UserInfo>>> {
		try {
			const response = await api.get<ApiResponse<PaginatedResponse<UserInfo>>>(
				`/users/${userId}/following`,
				{
					params: { page, limit },
				}
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching following:', error);
			throw error;
		}
	},

	/**
	 * Get user follow statistics
	 */
	async getFollowStats(
		userId: string
	): Promise<ApiResponse<{ followersCount: number; followingCount: number }>> {
		try {
			const response = await api.get<
				ApiResponse<{ followersCount: number; followingCount: number }>
			>(`/users/${userId}/follow-stats`);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching follow stats:', error);
			throw error;
		}
	},

	/**
	 * Check if current user is following a user
	 */
	async isFollowing(userId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
		try {
			const response = await api.get<ApiResponse<{ isFollowing: boolean }>>(
				`/users/${userId}/is-following`
			);
			return response.data;
		} catch (error: any) {
			logger.error('Error checking follow status:', error);
			throw error;
		}
	},

	/**
	 * Get user info by ID
	 */
	async getUserInfo(userId: string): Promise<ApiResponse<UserInfo>> {
		try {
			const response = await api.get<ApiResponse<UserInfo>>(`/community/users/${userId}`);
			return response.data;
		} catch (error: any) {
			logger.error('Error fetching user info:', error);
			throw error;
		}
	},

	/**
	 * Search across posts, comments, and knowledge resources
	 */
	async search(
		query: string,
		page: number = 1,
		limit: number = 20
	): Promise<
		ApiResponse<{
			posts: PaginatedResponse<Post>;
			comments: PaginatedResponse<Comment>;
			knowledgeResources: PaginatedResponse<KnowledgeResource>;
		}>
	> {
		try {
			const response = await api.get<
				ApiResponse<{
					posts: PaginatedResponse<Post>;
					comments: PaginatedResponse<Comment>;
					knowledgeResources: PaginatedResponse<KnowledgeResource>;
				}>
			>('/community/search', {
				params: { q: query, page, limit },
			});
			return response.data;
		} catch (error: any) {
			logger.error('Error searching community:', error);
			throw error;
		}
	},
};
