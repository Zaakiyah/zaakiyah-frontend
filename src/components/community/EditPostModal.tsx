import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityService } from '../../services/communityService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import Checkbox from '../ui/Checkbox';
import type { Post, CreatePostData } from '../../types/community.types';
import { PostType } from '../../types/community.types';

interface EditPostModalProps {
	isOpen: boolean;
	onClose: () => void;
	post: Post | null;
	onSuccess?: (updatedPost: Post) => void;
}

interface MediaItem {
	id: string;
	file?: File;
	url: string;
	progress: number;
	error?: string;
	isVideo: boolean;
	preview: string;
	isExisting: boolean; // true if from original post, false if newly uploaded
}

export default function EditPostModal({ isOpen, onClose, post, onSuccess }: EditPostModalProps) {
	const [content, setContent] = useState('');
	const [type, setType] = useState<PostType>(PostType.GENERAL);
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadedUrlsRef = useRef<string[]>([]); // Track newly uploaded URLs for cleanup

	// Initialize form with post data
	useEffect(() => {
		if (post && isOpen) {
			setContent(post.content);
			setType(post.type);
			setIsAnonymous(post.isAnonymous);

			// Initialize media items from existing post media
			if (post.mediaUrls && post.mediaUrls.length > 0) {
				const existingItems: MediaItem[] = post.mediaUrls.map((url) => {
					const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
					return {
						id: `existing-${url}`,
						url,
						progress: 100,
						isVideo,
						preview: url,
						isExisting: true,
					};
				});
				setMediaItems(existingItems);
			} else {
				setMediaItems([]);
			}

			// Reset cleanup tracking
			uploadedUrlsRef.current = [];
		}
	}, [post, isOpen]);

	// Cleanup newly uploaded media when modal closes without saving
	useEffect(() => {
		if (!isOpen && uploadedUrlsRef.current.length > 0) {
			// Cleanup newly uploaded files that weren't used
			uploadedUrlsRef.current.forEach((url) => {
				communityService.deleteMedia(url).catch((error) => {
					logger.error('Error cleaning up media:', error);
				});
			});
			uploadedUrlsRef.current = [];
		}
	}, [isOpen]);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validate file types and sizes
		const validFiles: File[] = [];
		for (const file of files) {
			const isImage = file.type.startsWith('image/');
			const isVideo = file.type.startsWith('video/');
			if (!isImage && !isVideo) {
				alert.error(`${file.name} is not a valid image or video file`);
				continue;
			}
			const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
			if (file.size > maxSize) {
				alert.error(`${file.name} exceeds maximum size (${isVideo ? '50MB' : '10MB'})`);
				continue;
			}
			validFiles.push(file);
		}

		if (validFiles.length === 0) return;

		// Create media items with previews
		const newItems: MediaItem[] = validFiles.map((file) => {
			const isVideo = file.type.startsWith('video/');
			const preview = URL.createObjectURL(file);
			return {
				id: `${Date.now()}-${Math.random()}`,
				file,
				url: '',
				progress: 0,
				isVideo,
				preview,
				isExisting: false,
			};
		});

		setMediaItems((prev) => [...prev, ...newItems]);

		// Upload each file immediately
		newItems.forEach((item) => {
			uploadFile(item);
		});

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const uploadFile = async (item: MediaItem) => {
		if (!item.file) return;

		try {
			setMediaItems((prev) =>
				prev.map((i) => (i.id === item.id ? { ...i, progress: 10, error: undefined } : i))
			);

			// Simulate progress (Cloudinary doesn't provide upload progress via API)
			const progressInterval = setInterval(() => {
				setMediaItems((prev) =>
					prev.map((i) => {
						if (i.id === item.id && i.progress < 90) {
							return { ...i, progress: Math.min(i.progress + 10, 90) };
						}
						return i;
					})
				);
			}, 200);

			const response = await communityService.uploadMedia(item.file);
			clearInterval(progressInterval);

			if (response.data?.url) {
				// Track newly uploaded URL for cleanup
				uploadedUrlsRef.current.push(response.data.url);

				setMediaItems((prev) =>
					prev.map((i) =>
						i.id === item.id
							? {
									...i,
									url: response.data.url,
									progress: 100,
									preview: response.data.url,
							  }
							: i
					)
				);
			}
		} catch (error: any) {
			logger.error('Error uploading file:', error);
			setMediaItems((prev) =>
				prev.map((i) =>
					i.id === item.id
						? {
								...i,
								error: error.response?.data?.message || 'Upload failed',
								progress: 0,
						  }
						: i
				)
			);
			alert.error(`Failed to upload ${item.file.name}`);
		}
	};

	const handleRemoveMedia = async (itemId: string) => {
		const item = mediaItems.find((i) => i.id === itemId);
		if (!item) return;

		// If it's a newly uploaded file (not existing), delete from Cloudinary
		if (!item.isExisting && item.url) {
			try {
				await communityService.deleteMedia(item.url);
				// Remove from cleanup tracking
				uploadedUrlsRef.current = uploadedUrlsRef.current.filter((url) => url !== item.url);
			} catch (error) {
				logger.error('Error deleting media:', error);
				// Continue with removal even if delete fails
			}
		}

		// Clean up preview URL if it's a blob URL
		if (item.preview && item.preview.startsWith('blob:')) {
			URL.revokeObjectURL(item.preview);
		}

		setMediaItems((prev) => prev.filter((i) => i.id !== itemId));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || !post) {
			alert.error('Please enter some content');
			return;
		}

		// Check if any uploads are still in progress
		const hasUploading = mediaItems.some(
			(item) => !item.url && !item.error && item.progress < 100
		);
		if (hasUploading) {
			alert.error('Please wait for all media to finish uploading');
			return;
		}

		// Check if any uploads failed
		const hasErrors = mediaItems.some((item) => item.error);
		if (hasErrors) {
			alert.error('Please remove failed uploads or try again');
			return;
		}

		try {
			setIsSubmitting(true);
			const uploadedUrls = mediaItems
				.map((item) => item.url)
				.filter((url): url is string => !!url);

			const data: Partial<CreatePostData> = {
				content: content.trim(),
				type: type !== PostType.GENERAL ? type : undefined,
				mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
				isAnonymous,
			};
			const response = await communityService.updatePost(post.id, data);
			if (response.data) {
				// Clear cleanup tracking since files are now used
				uploadedUrlsRef.current = [];

				// Clean up preview URLs
				mediaItems.forEach((item) => {
					if (item.preview && item.preview.startsWith('blob:')) {
						URL.revokeObjectURL(item.preview);
					}
				});

				onSuccess?.(response.data);
				onClose();
			}
		} catch (error: any) {
			logger.error('Error updating post:', error);
			alert.error(error.response?.data?.message || 'Failed to update post');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		// Clean up preview URLs
		mediaItems.forEach((item) => {
			if (item.preview && item.preview.startsWith('blob:')) {
				URL.revokeObjectURL(item.preview);
			}
		});
		onClose();
	};

	if (!post) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleClose}
						className="fixed inset-0 bg-black/50 z-50"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed inset-x-4 top-20 bottom-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 flex flex-col"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
							<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
								Edit Post
							</h2>
							<button
								onClick={handleClose}
								className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
								aria-label="Close"
							>
								<XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
							</button>
						</div>

						{/* Form */}
						<form
							onSubmit={handleSubmit}
							className="flex-1 flex flex-col overflow-hidden"
						>
							<div className="flex-1 overflow-y-auto p-5 space-y-5">
								{/* Post Type */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
										Post Type
									</label>
									<div className="grid grid-cols-2 gap-2">
										{[
											{
												value: PostType.GENERAL,
												label: 'General',
												icon: '💬',
											},
											{
												value: PostType.MILESTONE,
												label: 'Milestone',
												icon: '🎯',
											},
											{
												value: PostType.QUESTION,
												label: 'Question',
												icon: '❓',
											},
											{ value: PostType.STORY, label: 'Story', icon: '📖' },
											{
												value: PostType.INSPIRATION,
												label: 'Inspiration',
												icon: '✨',
											},
										].map((option) => (
											<button
												key={option.value}
												type="button"
												onClick={() => setType(option.value)}
												className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
													type === option.value
														? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
														: 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
												}`}
											>
												<span className="text-2xl mb-1 block">
													{option.icon}
												</span>
												<span
													className={`text-sm font-semibold ${
														type === option.value
															? 'text-primary-700 dark:text-primary-300'
															: 'text-slate-700 dark:text-slate-300'
													}`}
												>
													{option.label}
												</span>
											</button>
										))}
									</div>
								</div>

								{/* Content */}
								<div className="flex-1">
									<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
										What's on your mind?
									</label>
									<textarea
										value={content}
										onChange={(e) => setContent(e.target.value)}
										placeholder="Share your thoughts, questions, or experiences..."
										rows={10}
										maxLength={5000}
										className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-[15px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
									/>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
										{content.length}/5000
									</p>
								</div>

								{/* Media Upload */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
										Media (optional)
									</label>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*,video/*"
										multiple
										onChange={handleFileSelect}
										className="hidden"
									/>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400"
									>
										<PhotoIcon className="w-5 h-5" />
										<span className="text-sm font-medium">
											Add photos or videos
										</span>
									</button>

									{/* Media Previews */}
									{mediaItems.length > 0 && (
										<div className="mt-3 grid grid-cols-2 gap-3">
											{mediaItems.map((item) => (
												<div
													key={item.id}
													className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700"
												>
													{/* Preview */}
													<div className="aspect-square relative">
														{item.isVideo ? (
															<video
																src={item.preview}
																className="w-full h-full object-cover"
																preload="metadata"
															/>
														) : (
															<img
																src={item.preview}
																alt="Preview"
																className="w-full h-full object-cover"
															/>
														)}

														{/* Progress Overlay */}
														{(!item.url || item.progress < 100) && (
															<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
																<div className="w-full px-4">
																	<div className="w-full bg-slate-700 rounded-full h-2 mb-2">
																		<div
																			className="bg-primary-500 h-2 rounded-full transition-all duration-300"
																			style={{
																				width: `${item.progress}%`,
																			}}
																		/>
																	</div>
																	<p className="text-xs text-white text-center">
																		{item.error
																			? 'Upload failed'
																			: `${item.progress}%`}
																	</p>
																</div>
															</div>
														)}

														{/* Error Badge */}
														{item.error && (
															<div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
																Error
															</div>
														)}

														{/* Remove Button */}
														<button
															type="button"
															onClick={() =>
																handleRemoveMedia(item.id)
															}
															className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
														>
															<TrashIcon className="w-4 h-4 text-white" />
														</button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Anonymous */}
								<div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
									<Checkbox
										checked={isAnonymous}
										onChange={setIsAnonymous}
										label="Post anonymously"
									/>
								</div>
							</div>

							{/* Footer */}
							<div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
								<button
									type="submit"
									disabled={
										isSubmitting ||
										!content.trim() ||
										mediaItems.some(
											(item) =>
												!item.url && !item.error && item.progress < 100
										)
									}
									className="w-full py-3.5 px-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98 shadow-sm hover:shadow-md"
								>
									{isSubmitting ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</form>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
