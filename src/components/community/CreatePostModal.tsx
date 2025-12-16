import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityService } from '../../services/communityService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CreatePostData } from '../../types/community.types';
import { PostType } from '../../types/community.types';

interface CreatePostModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function CreatePostModal({
	isOpen,
	onClose,
	onSuccess,
}: CreatePostModalProps) {
	const [content, setContent] = useState('');
	const [type, setType] = useState<PostType>(PostType.GENERAL);
	const [mediaUrl, setMediaUrl] = useState('');
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) {
			alert.error('Please enter some content');
			return;
		}

		try {
			setIsSubmitting(true);
			const data: CreatePostData = {
				content: content.trim(),
				type: type !== 'general' ? type : undefined,
				mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : undefined,
				isAnonymous,
			};
			await communityService.createPost(data);
			// Reset form
			setContent('');
			setType(PostType.GENERAL);
			setMediaUrl('');
			setIsAnonymous(false);
			onClose();
			onSuccess?.();
		} catch (error: any) {
			logger.error('Error creating post:', error);
			// Silently fail - user can retry
		} finally {
			setIsSubmitting(false);
		}
	};

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
								Create Post
							</h2>
							<button
								onClick={onClose}
								className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
								aria-label="Close"
							>
								<XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
							</button>
						</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
						<div className="flex-1 overflow-y-auto p-5 space-y-5">
							{/* Post Type */}
							<div>
								<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
									Post Type
								</label>
								<div className="grid grid-cols-2 gap-2">
									{[
										{ value: PostType.GENERAL, label: 'General', icon: '💬' },
										{ value: PostType.MILESTONE, label: 'Milestone', icon: '🎯' },
										{ value: PostType.QUESTION, label: 'Question', icon: '❓' },
										{ value: PostType.STORY, label: 'Story', icon: '📖' },
										{ value: PostType.INSPIRATION, label: 'Inspiration', icon: '✨' },
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
											<span className="text-2xl mb-1 block">{option.icon}</span>
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

								{/* Media URL */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
										Image URL (optional)
									</label>
									<input
										type="url"
										value={mediaUrl}
										onChange={(e) => setMediaUrl(e.target.value)}
										placeholder="https://example.com/image.jpg"
										className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									/>
									{mediaUrl && (
										<div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
											<img
												src={mediaUrl}
												alt="Preview"
												className="w-full h-48 object-cover"
												onError={(e) => {
													e.currentTarget.style.display = 'none';
												}}
											/>
										</div>
									)}
								</div>

								{/* Anonymous */}
								<label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
									<input
										type="checkbox"
										checked={isAnonymous}
										onChange={(e) => setIsAnonymous(e.target.checked)}
										className="w-5 h-5 text-primary-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-primary-500"
									/>
									<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
										Post anonymously
									</span>
								</label>
							</div>

							{/* Footer */}
							<div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
								<button
									type="submit"
									disabled={isSubmitting || !content.trim()}
									className="w-full py-3.5 px-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98 shadow-sm hover:shadow-md"
								>
									{isSubmitting ? 'Posting...' : 'Post'}
								</button>
							</div>
						</form>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}



