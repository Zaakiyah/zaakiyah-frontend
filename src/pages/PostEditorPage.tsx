import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { communityService } from '../services/communityService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import { shortenUrlsInText } from '../utils/textUtils';
import { motion, AnimatePresence } from 'framer-motion';
import {
	PhotoIcon,
	XMarkIcon,
	ChevronDownIcon,
	PlayIcon,
	InformationCircleIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import Avatar from '../components/ui/Avatar';
import { useUserTagging, UserTaggingSuggestions } from '../hooks/useUserTagging';
import MentionTextarea from '../components/ui/MentionTextarea';
import ConfirmDialog from '../components/ui/ConfirmDialog';

interface MediaItem {
	id: string;
	file?: File;
	preview: string;
	type: 'image' | 'video';
	cloudinaryUrl?: string; // URL after upload to Cloudinary
	uploadProgress?: number; // 0-100
	isUploading?: boolean;
	isDeleting?: boolean;
}

export default function PostEditorPage() {
	useTheme();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { user } = useAuthStore();
	const isEditMode = !!id;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const audienceMenuRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	const [content, setContent] = useState('');

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
		value: content,
		onChange: setContent,
		textareaRef,
		currentUserId: user?.id,
	});
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const [isPublic, setIsPublic] = useState(true);
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showAudienceMenu, setShowAudienceMenu] = useState(false);
	const [showResolutionInfo, setShowResolutionInfo] = useState(false);
	const [showCancelDialog, setShowCancelDialog] = useState(false);


	// Close audience menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (audienceMenuRef.current && !audienceMenuRef.current.contains(event.target as Node)) {
				setShowAudienceMenu(false);
			}
		};

		if (showAudienceMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showAudienceMenu]);

	// Clean up preview URLs and delete Cloudinary files on unmount if post not submitted
	useEffect(() => {
		return () => {
			// Clean up blob URLs
			mediaItems.forEach((item) => {
				if (item.preview.startsWith('blob:')) {
					URL.revokeObjectURL(item.preview);
				}
			});
		};
	}, []);

	// Cleanup function for cancel - delete uploaded files from Cloudinary
	const cleanupUploadedMedia = async () => {
		const itemsToDelete = mediaItems.filter(item => item.cloudinaryUrl && !item.isDeleting);
		if (itemsToDelete.length === 0) return;

		// Delete all uploaded files
		const deletePromises = itemsToDelete.map(item => 
			communityService.deleteMedia(item.cloudinaryUrl!).catch(err => {
				logger.error('Error cleaning up media:', err);
			})
		);
		await Promise.all(deletePromises);
	};

	// Fetch post data if editing
	useEffect(() => {
		if (isEditMode && id) {
			const fetchPost = async () => {
				try {
					const response = await communityService.getPostById(id);
					if (response.data) {
						const post = response.data;
						setContent(post.content);
						setIsPublic(post.isPublic !== undefined ? post.isPublic : true);
						setIsAnonymous(post.isAnonymous || false);
					if (post.mediaUrls && post.mediaUrls.length > 0) {
						// Handle multiple media URLs from existing post
						const items: MediaItem[] = post.mediaUrls.map((url, index) => {
							const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('/video/');
							return {
								id: `existing-${index}`,
								preview: url,
								cloudinaryUrl: url, // Mark as already uploaded
								type: isVideo ? 'video' : 'image',
								uploadProgress: 100,
								isUploading: false,
							};
						});
						setMediaItems(items);
					}
					}
				} catch (error: any) {
					logger.error('Error fetching post:', error);
					navigate('/community');
				}
			};
			fetchPost();
		}
	}, [id, isEditMode, navigate]);

	const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validate files first
		const validFiles: File[] = [];
		files.forEach((file) => {
			// Validate file type
			const isImage = file.type.startsWith('image/');
			const isVideo = file.type.startsWith('video/');

			if (!isImage && !isVideo) {
				alert.error(`${file.name} is not a valid image or video file`);
				return;
			}

			// Validate file size (max 50MB for videos, 10MB for images)
			const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
			if (file.size > maxSize) {
				alert.error(`${file.name} is too large. Max size: ${isVideo ? '50MB' : '10MB'}`);
				return;
			}

			validFiles.push(file);
		});

		if (validFiles.length === 0) return;

		// Check if adding these files would exceed the limit
		const currentCount = mediaItems.length;
		if (currentCount + validFiles.length > 10) {
			alert.error(`Maximum 10 media items allowed. You can add ${10 - currentCount} more.`);
			return;
		}

		// Create media items and upload immediately
		validFiles.forEach(async (file) => {
			const isVideo = file.type.startsWith('video/');
			const preview = URL.createObjectURL(file);
			const mediaId = `${Date.now()}-${Math.random()}`;

			// Add item with uploading state
			const newItem: MediaItem = {
				id: mediaId,
				file,
				preview,
				type: isVideo ? 'video' : 'image',
				uploadProgress: 0,
				isUploading: true,
			};

			setMediaItems((prev) => [...prev, newItem].slice(0, 10));

			try {
				// Upload to Cloudinary with progress tracking
				// Note: axios doesn't support progress for FormData uploads directly
				// We'll simulate progress or use XMLHttpRequest for real progress
				const uploadResponse = await communityService.uploadMedia(file);
				
				if (uploadResponse.data?.url) {
					// Update item with Cloudinary URL
					setMediaItems((prev) =>
						prev.map((item) =>
							item.id === mediaId
								? {
										...item,
										cloudinaryUrl: uploadResponse.data.url,
										uploadProgress: 100,
										isUploading: false,
									}
								: item
						)
					);
					// Revoke blob URL since we now have Cloudinary URL
					URL.revokeObjectURL(preview);
				}
			} catch (error: any) {
				logger.error('Error uploading media:', error);
				alert.error(`Failed to upload ${file.name}. Please try again.`);
				// Remove failed item
				setMediaItems((prev) => {
					const item = prev.find((item) => item.id === mediaId);
					if (item && item.preview.startsWith('blob:')) {
						URL.revokeObjectURL(item.preview);
					}
					return prev.filter((item) => item.id !== mediaId);
				});
			}
		});

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleRemoveMedia = async (id: string) => {
		const item = mediaItems.find((item) => item.id === id);
		if (!item) return;

		// If item has been uploaded to Cloudinary OR is an existing URL from edit mode, delete it
		const urlToDelete = item.cloudinaryUrl || (!item.preview.startsWith('blob:') ? item.preview : null);
		
		if (urlToDelete) {
			// Set deleting state
			setMediaItems((prev) =>
				prev.map((media) =>
					media.id === id ? { ...media, isDeleting: true } : media
				)
			);

			try {
				await communityService.deleteMedia(urlToDelete);
			} catch (error: any) {
				logger.error('Error deleting media from Cloudinary:', error);
				// Continue with removal even if Cloudinary deletion fails
			}
		}

		// Remove item from state
		setMediaItems((prev) => {
			const itemToRemove = prev.find((item) => item.id === id);
			if (itemToRemove) {
				// Revoke blob URL if it's a blob
				if (itemToRemove.preview.startsWith('blob:')) {
					URL.revokeObjectURL(itemToRemove.preview);
				}
			}
			return prev.filter((item) => item.id !== id);
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() && mediaItems.length === 0) {
			alert.error('Please enter some content or add media');
			return;
		}

		try {
			setIsSubmitting(true);
			
			// Backend requires non-empty content, so if user only has media, send a minimal placeholder
			let postContent = content.trim() || (mediaItems.length > 0 ? '.' : '');
			
			// Ensure we have valid content
			if (!postContent || typeof postContent !== 'string') {
				postContent = mediaItems.length > 0 ? '.' : '';
			}
			
			// Shorten URLs in the content before saving (only if content exists)
			if (postContent && postContent.trim()) {
				postContent = await shortenUrlsInText(postContent);
			}
			
			// Final validation - ensure we have a string
			if (!postContent || typeof postContent !== 'string') {
				postContent = mediaItems.length > 0 ? '.' : '';
			}

			// Collect media URLs - all should already be uploaded
			const mediaUrls: string[] = [];
			
			// Check if any items are still uploading
			const stillUploading = mediaItems.some(item => item.isUploading);
			if (stillUploading) {
				alert.error('Please wait for all media to finish uploading');
				return;
			}

			// Collect Cloudinary URLs (already uploaded) or existing URLs (from edit mode)
			mediaItems.forEach(item => {
				if (item.cloudinaryUrl) {
					// Already uploaded to Cloudinary
					mediaUrls.push(item.cloudinaryUrl);
				} else if (!item.preview.startsWith('blob:')) {
					// Existing URL from edit mode (not a blob)
					mediaUrls.push(item.preview);
				}
				// If it's still a blob URL, it means upload failed - skip it
			});

			// Create FormData for post creation/update
			const formData = new FormData();
			formData.append('content', postContent);
			formData.append('isPublic', String(isPublic));
			formData.append('isAnonymous', String(isAnonymous));

			if (mediaUrls.length > 0) {
				// Send mediaUrls as JSON array string
				formData.append('mediaUrls', JSON.stringify(mediaUrls));
			}

			if (isEditMode && id) {
				const response = await communityService.updatePost(id, formData);
				if (response.data) {
					alert.success('Post updated successfully');
					navigate(`/community/posts/${id}`);
				}
			} else {
				await communityService.createPost(formData);
				alert.success('Post created successfully');
				navigate('/community');
			}
		} catch (error: any) {
			logger.error('Error saving post:', error);
			alert.error(error.response?.data?.message || 'Failed to save post');
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderMediaPreview = (item: MediaItem, index: number) => {
		const mediaUrl = item.cloudinaryUrl || item.preview;
		const isUploading = item.isUploading || false;
		const isDeleting = item.isDeleting || false;
		const uploadProgress = item.uploadProgress || 0;

		return (
			<motion.div
				key={item.id}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.2 }}
				className="relative group"
			>
				<div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
					{item.type === 'image' ? (
						<img
							src={mediaUrl}
							alt={`Media ${index + 1}`}
							className="w-full h-full object-cover"
						/>
					) : (
						<>
							<video
								src={mediaUrl}
								className="w-full h-full object-cover"
								controls={false}
							/>
							<div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
								<div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center shadow-lg ring-2 ring-white/20">
									<PlayIcon className="w-7 h-7 text-white ml-0.5" />
								</div>
							</div>
						</>
					)}
					
					{/* Upload Progress Overlay */}
					{isUploading && (
						<div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
							<div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
							<div className="w-3/4 bg-slate-700 rounded-full h-2 overflow-hidden">
								<div
									className="bg-primary-500 h-full transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
							<p className="text-white text-xs mt-2 font-medium">
								{uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
							</p>
						</div>
					)}

					{/* Deleting Overlay */}
					{isDeleting && (
						<div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
							<div className="flex flex-col items-center gap-2">
								<div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
								<p className="text-white text-xs font-medium">Deleting...</p>
							</div>
						</div>
					)}

					{/* Remove Button - disabled during upload/delete */}
					{!isUploading && !isDeleting && (
						<button
							type="button"
							onClick={() => handleRemoveMedia(item.id)}
							className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-red-500 text-white rounded-full transition-all shadow-lg backdrop-blur-sm z-20"
							aria-label="Remove media"
						>
							<XMarkIcon className="w-4 h-4" />
						</button>
					)}

					{item.type === 'video' && !isUploading && !isDeleting && (
						<div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold rounded-lg uppercase tracking-wide">
							Video
						</div>
					)}
				</div>
			</motion.div>
		);
	};

	return (
		<div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden pb-20 sm:pb-0">
			{/* Header */}
			<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-40 shadow-sm">
				<div className="px-4 py-3.5">
					<div className="flex items-center justify-between">
						<button
							onClick={async () => {
								// Check if there are changes
								const hasChanges = content.trim().length > 0 || mediaItems.length > 0;
								if (hasChanges) {
									setShowCancelDialog(true);
								} else {
									// Clean up any uploaded media before navigating
									await cleanupUploadedMedia();
									navigate(-1);
								}
							}}
							className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
							type="button"
						>
							Cancel
						</button>
						<h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
							{isEditMode ? 'Edit Post' : 'New Post'}
						</h1>
						<button
							onClick={handleSubmit}
							disabled={isSubmitting || (!content.trim() && mediaItems.length === 0)}
							className="px-5 py-2 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shadow-primary-500/20"
							type="button"
						>
							{isSubmitting ? 'Posting...' : isEditMode ? 'Update' : 'Post'}
						</button>
					</div>
				</div>
			</header>

			{/* Form */}
			<form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
				<div className="flex-1 overflow-y-auto pb-24 sm:pb-0">
					{/* Main Content Area */}
					<div className="bg-white dark:bg-slate-800 mx-4 mt-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
						{/* Profile and Settings Bar */}
						<div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
							<div className="flex items-center gap-3 mb-3">
							{isAnonymous ? (
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
									<span className="text-lg font-bold text-white">A</span>
								</div>
							) : (
								<Avatar
									avatarUrl={user?.avatarUrl}
									firstName={user?.firstName || ''}
									lastName={user?.lastName || ''}
									size="lg"
									isVerified={user?.isVerified}
									isAdmin={user?.isAdmin}
								/>
							)}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-1.5">
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
											{isAnonymous ? 'Anonymous' : `${user?.firstName} ${user?.lastName}`}
										</p>
										{/* Badges next to name - only show when not anonymous */}
										{!isAnonymous && user?.isAdmin && (
											<ShieldCheckIcon className="w-4 h-4 text-amber-500 shrink-0" title="Admin" />
										)}
										{!isAnonymous && user?.isVerified && !user?.isAdmin && (
											<CheckBadgeIcon className="w-4 h-4 text-primary-500 shrink-0" title="Verified" />
										)}
									</div>
									<div className="flex items-center gap-2 mt-0.5">
										<div className="relative" ref={audienceMenuRef}>
											<button
												type="button"
												onClick={() => setShowAudienceMenu(!showAudienceMenu)}
												className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all active:scale-95"
											>
												{isPublic ? (
													<>
														<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
														</svg>
														<span>Everyone</span>
													</>
												) : (
													<>
														<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
														</svg>
														<span>Only Me</span>
													</>
												)}
												<ChevronDownIcon className="w-3 h-3" />
											</button>
											{showAudienceMenu && (
												<motion.div
													initial={{ opacity: 0, y: -5 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -5 }}
													className="absolute top-full left-0 mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50"
												>
													<button
														type="button"
														onClick={() => {
															setIsPublic(true);
															setShowAudienceMenu(false);
														}}
														className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${
															isPublic ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
														}`}
													>
														<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
														</svg>
														<span>Everyone</span>
													</button>
													<button
														type="button"
														onClick={() => {
															setIsPublic(false);
															setIsAnonymous(false); // Reset anonymous when switching to "Only Me"
															setShowAudienceMenu(false);
														}}
														className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${
															!isPublic ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
														}`}
													>
														<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
														</svg>
														<span>Only Me</span>
													</button>
												</motion.div>
											)}
										</div>
										{/* Anonymous Toggle - Only show when post is public */}
										{isPublic && (
											<button
												type="button"
												onClick={() => setIsAnonymous(!isAnonymous)}
												className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
													isAnonymous
														? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
														: 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
												}`}
											>
												<svg
													className={`w-3.5 h-3.5 ${isAnonymous ? 'opacity-100' : 'opacity-50'}`}
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
													/>
												</svg>
												<span>Anonymous</span>
											</button>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Content Editor */}
						<div className="px-4 py-5">
							<div className="relative">
								<MentionTextarea
									ref={textareaRef}
									value={content}
									onChange={handleTaggingChange}
									onKeyDown={handleTaggingKeyDown}
									placeholder="What's on your mind?"
									rows={6}
									maxLength={5000}
									className="w-full bg-transparent border-0 text-[16px] leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none min-h-[120px]"
									autoFocus
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
							{content.length > 0 && (
								<div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
									<p className="text-xs text-slate-400 dark:text-slate-500 text-right">
										{content.length.toLocaleString()} / 5,000
									</p>
								</div>
							)}
							
							{/* Formatting Guide */}
							<div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
								<details className="group">
									<summary className="cursor-pointer text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1.5">
										<InformationCircleIcon className="w-4 h-4" />
										<span>Formatting Help</span>
									</summary>
									<div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
										<div>
											<p className="font-semibold mb-1">Lists:</p>
											<p className="text-slate-500 dark:text-slate-500">
												Use <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">-</code> at the start of a line to create a bullet list
											</p>
											<p className="text-slate-400 dark:text-slate-600 mt-1 italic">
												Example: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">- Item one</code>
											</p>
										</div>
										<div>
											<p className="font-semibold mb-1">Links & Hashtags:</p>
											<p className="text-slate-500 dark:text-slate-500">
												Links and hashtags are automatically detected and made clickable
											</p>
										</div>
										<div>
											<p className="font-semibold mb-1">Mentions:</p>
											<p className="text-slate-500 dark:text-slate-500">
												Type <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">@</code> followed by a username to mention someone
											</p>
										</div>
									</div>
								</details>
							</div>
						</div>
					</div>

					{/* Media Gallery */}
					{mediaItems.length > 0 && (
						<div className="px-4 mt-4 mb-4">
							<div
								className={`grid gap-3 ${
									mediaItems.length === 1
										? 'grid-cols-1'
										: mediaItems.length === 2
										? 'grid-cols-2'
										: 'grid-cols-2'
								}`}
							>
								<AnimatePresence>
									{mediaItems.map((item, index) => renderMediaPreview(item, index))}
								</AnimatePresence>
							</div>
						</div>
					)}
				</div>

				{/* Bottom Action Bar - Media Attachment */}
				<div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto z-10 pb-safe">
					<div className="flex items-center gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*,video/*"
							multiple
							onChange={handleMediaSelect}
							className="hidden"
						/>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={mediaItems.length >= 10}
							className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-1 border border-slate-200 dark:border-slate-600"
						>
							<PhotoIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
							<span>
								{mediaItems.length === 0
									? 'Add photos or videos'
									: `Add more (${mediaItems.length}/10)`}
							</span>
						</button>
						
						{/* Info Icon Button */}
						<button
							type="button"
							onClick={() => setShowResolutionInfo(!showResolutionInfo)}
							className="p-3 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-600"
							aria-label="Show file specifications"
							title="File specifications"
						>
							<InformationCircleIcon className="w-5 h-5" />
						</button>
					</div>
					
					{/* Collapsible Resolution Guidance */}
					<AnimatePresence>
						{showResolutionInfo && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
								className="overflow-hidden"
							>
								<div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-xl border border-primary-200/50 dark:border-primary-800/30">
									<InformationCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-xs font-semibold text-primary-900 dark:text-primary-200 mb-2">
											Recommended File Specifications
										</p>
										<div className="text-xs text-primary-800 dark:text-primary-300 space-y-1.5">
											<div className="flex items-start gap-2">
												<span className="font-semibold min-w-[50px]">Images:</span>
												<span>1080×1080 to 1920×1920 (square recommended). Max size: 10MB.</span>
											</div>
											<div className="flex items-start gap-2">
												<span className="font-semibold min-w-[50px]">Videos:</span>
												<span>1080p (1920×1080) or 720p (1280×720). Max size: 50MB.</span>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</form>

			{/* Cancel Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showCancelDialog}
				onClose={() => setShowCancelDialog(false)}
				onConfirm={async () => {
					setShowCancelDialog(false);
					// Clean up uploaded media before navigating
					await cleanupUploadedMedia();
					navigate(-1);
				}}
				title={isEditMode ? 'Discard Changes?' : 'Discard Post?'}
				message={
					isEditMode
						? 'Are you sure you want to discard your changes? This action cannot be undone.'
						: 'You have unsaved changes. Are you sure you want to discard this post? This action cannot be undone.'
				}
				confirmText="Discard"
				confirmVariant="danger"
				cancelText="Cancel"
			/>
		</div>
	);
}
