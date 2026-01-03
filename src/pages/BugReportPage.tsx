import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { bugReportService, type BugReportData } from '../services/bugReportService';
import { communityService } from '../services/communityService';
import { alert } from '../store/alertStore';
import { logger } from '../utils/logger';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';
import {
	BugAntIcon,
	PhotoIcon,
	TrashIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface MediaItem {
	id: string;
	file: File;
	url?: string;
	progress: number;
	error?: string;
	preview: string;
}

export default function BugReportPage() {
	useTheme();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState<BugReportData['category']>('bug');
	const [severity, setSeverity] = useState<BugReportData['severity']>('medium');
	const [stepsToReproduce, setStepsToReproduce] = useState('');
	const [expectedBehavior, setExpectedBehavior] = useState('');
	const [actualBehavior, setActualBehavior] = useState('');
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deviceInfo, setDeviceInfo] = useState<BugReportData['deviceInfo'] | null>(null);

	// Collect device info on mount
	useEffect(() => {
		const info: BugReportData['deviceInfo'] = {
			platform: navigator.platform || 'Unknown',
			userAgent: navigator.userAgent || 'Unknown',
			screenResolution: `${window.screen.width}x${window.screen.height}`,
		};

		// Try to get app version from package.json or environment
		if (import.meta.env.VITE_APP_VERSION) {
			info.appVersion = import.meta.env.VITE_APP_VERSION;
		}

		setDeviceInfo(info);
	}, []);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validate file types (only images for bug reports)
		const validFiles: File[] = [];
		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				alert.error(`${file.name} is not a valid image file`);
				continue;
			}
			const maxSize = 10 * 1024 * 1024; // 10MB
			if (file.size > maxSize) {
				alert.error(`${file.name} exceeds maximum size (10MB)`);
				continue;
			}
			validFiles.push(file);
		}

		if (validFiles.length === 0) return;

		// Create media items with previews
		const newItems: MediaItem[] = validFiles.map((file) => {
			const preview = URL.createObjectURL(file);
			return {
				id: `${Date.now()}-${Math.random()}`,
				file,
				progress: 0,
				preview,
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
		try {
			setMediaItems((prev) =>
				prev.map((i) => (i.id === item.id ? { ...i, progress: 10, error: undefined } : i))
			);

			// Simulate progress
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
				setMediaItems((prev) =>
					prev.map((i) =>
						i.id === item.id ? { ...i, url: response.data.url, progress: 100 } : i
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

		// If file was uploaded, delete from Cloudinary
		if (item.url) {
			try {
				await communityService.deleteMedia(item.url);
			} catch (error) {
				logger.error('Error deleting media:', error);
			}
		}

		// Clean up preview URL
		if (item.preview) {
			URL.revokeObjectURL(item.preview);
		}

		setMediaItems((prev) => prev.filter((i) => i.id !== itemId));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) {
			alert.error('Please enter a title for the bug report');
			return;
		}

		if (!description.trim()) {
			alert.error('Please describe the issue');
			return;
		}

		// Check if any uploads are still in progress
		const hasUploading = mediaItems.some(
			(item) => !item.url && !item.error && item.progress < 100
		);
		if (hasUploading) {
			alert.error('Please wait for all screenshots to finish uploading');
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

			const screenshotUrls = mediaItems
				.map((item) => item.url)
				.filter((url): url is string => !!url);

			const bugReportData: BugReportData = {
				title: title.trim(),
				description: description.trim(),
				category,
				severity,
				screenshotUrls: screenshotUrls.length > 0 ? screenshotUrls : undefined,
				deviceInfo: deviceInfo || undefined,
				stepsToReproduce: stepsToReproduce.trim() || undefined,
				expectedBehavior: expectedBehavior.trim() || undefined,
				actualBehavior: actualBehavior.trim() || undefined,
			};

			const response = await bugReportService.submitBugReport(bugReportData);

			if (response.data) {
				alert.success(
					'Bug report submitted successfully! Thank you for helping us improve Zaakiyah.'
				);

				// Clean up preview URLs
				mediaItems.forEach((item) => {
					if (item.preview) {
						URL.revokeObjectURL(item.preview);
					}
				});

				// Reset form
				setTitle('');
				setDescription('');
				setCategory('bug');
				setSeverity('medium');
				setStepsToReproduce('');
				setExpectedBehavior('');
				setActualBehavior('');
				setMediaItems([]);

				// Navigate back after a short delay
				setTimeout(() => {
					navigate(-1);
				}, 1500);
			}
		} catch (error: any) {
			logger.error('Error submitting bug report:', error);
			alert.error(
				error.response?.data?.message || 'Failed to submit bug report. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getSeverityColor = (sev: BugReportData['severity']) => {
		switch (sev) {
			case 'critical':
				return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
			case 'high':
				return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
			case 'medium':
				return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
			case 'low':
				return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
			default:
				return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
			<PageHeader title="Report a Bug" showBack />

			<main className="px-4 py-4">
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Info Banner */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-xl p-4 border border-primary-200/50 dark:border-primary-800/30"
					>
						<div className="flex items-start gap-3">
							<InformationCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
							<div className="flex-1">
								<p className="text-sm text-primary-900 dark:text-primary-200 font-medium mb-1">
									Help Us Improve
								</p>
								<p className="text-xs text-primary-800 dark:text-primary-300">
									Your feedback helps us identify and fix issues. Please provide
									as much detail as possible.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Title */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
					>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Title <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Brief description of the issue"
							maxLength={200}
							required
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all shadow-sm hover:shadow-md focus:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
						/>
					</motion.div>

					{/* Category and Severity */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4"
					>
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
								Category
							</label>
							<div className="grid grid-cols-2 gap-2">
								{[
									{ value: 'bug', label: 'Bug', icon: '🐛' },
									{ value: 'feature-request', label: 'Feature', icon: '✨' },
									{ value: 'ui-issue', label: 'UI Issue', icon: '🎨' },
									{ value: 'performance', label: 'Performance', icon: '⚡' },
									{ value: 'other', label: 'Other', icon: '📝' },
								].map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() =>
											setCategory(option.value as BugReportData['category'])
										}
										className={`px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
											category === option.value
												? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
												: 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600'
										}`}
									>
										<span className="mr-1.5">{option.icon}</span>
										{option.label}
									</button>
								))}
							</div>
						</div>

						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
								Severity
							</label>
							<div className="grid grid-cols-4 gap-2">
								{[
									{ value: 'low', label: 'Low' },
									{ value: 'medium', label: 'Medium' },
									{ value: 'high', label: 'High' },
									{ value: 'critical', label: 'Critical' },
								].map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() =>
											setSeverity(option.value as BugReportData['severity'])
										}
										className={`px-3 py-2 rounded-lg border-2 transition-all text-xs font-semibold ${
											severity === option.value
												? `${getSeverityColor(
														option.value as BugReportData['severity']
												  )} border-current`
												: 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</motion.div>

					{/* Description */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
					>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Description <span className="text-red-500">*</span>
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe the issue in detail..."
							rows={5}
							maxLength={2000}
							required
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 resize-none transition-all shadow-sm hover:shadow-md focus:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
						/>
					</motion.div>

					{/* Steps to Reproduce */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
					>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Steps to Reproduce (Optional)
						</label>
						<textarea
							value={stepsToReproduce}
							onChange={(e) => setStepsToReproduce(e.target.value)}
							placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
							rows={4}
							maxLength={1000}
							className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 resize-none transition-all shadow-sm hover:shadow-md focus:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
						/>
					</motion.div>

					{/* Expected vs Actual Behavior */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4"
					>
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
								Expected Behavior (Optional)
							</label>
							<textarea
								value={expectedBehavior}
								onChange={(e) => setExpectedBehavior(e.target.value)}
								placeholder="What should have happened?"
								rows={3}
								maxLength={500}
								className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 resize-none transition-all shadow-sm hover:shadow-md focus:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
								Actual Behavior (Optional)
							</label>
							<textarea
								value={actualBehavior}
								onChange={(e) => setActualBehavior(e.target.value)}
								placeholder="What actually happened?"
								rows={3}
								maxLength={500}
								className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 resize-none transition-all shadow-sm hover:shadow-md focus:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
							/>
						</div>
					</motion.div>

					{/* Screenshots */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.35 }}
						className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
					>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Screenshots (Optional)
						</label>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleFileSelect}
							className="hidden"
						/>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={mediaItems.length >= 5}
							className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<PhotoIcon className="w-5 h-5" />
							<span className="text-sm font-medium">
								{mediaItems.length === 0
									? 'Add screenshots'
									: `Add more (${mediaItems.length}/5)`}
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
										<div className="aspect-square relative">
											<img
												src={item.preview}
												alt="Screenshot preview"
												className="w-full h-full object-cover"
											/>

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
												onClick={() => handleRemoveMedia(item.id)}
												className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
											>
												<TrashIcon className="w-4 h-4 text-white" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</motion.div>

					{/* Device Info Notice */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700"
					>
						<p className="text-xs text-slate-600 dark:text-slate-400">
							Device information will be automatically included to help us diagnose
							the issue.
						</p>
					</motion.div>

					{/* Submit Button */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.45 }}
						className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-transparent"
					>
						<button
							type="submit"
							disabled={
								isSubmitting ||
								!title.trim() ||
								!description.trim() ||
								mediaItems.some(
									(item) => !item.url && !item.error && item.progress < 100
								)
							}
							className="w-full py-3.5 px-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								<>
									<Loader size="sm" className="text-white" />
									<span>Submitting...</span>
								</>
							) : (
								<>
									<BugAntIcon className="w-5 h-5" />
									<span>Submit Bug Report</span>
								</>
							)}
						</button>
					</motion.div>
				</form>
			</main>
		</div>
	);
}
