import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { communityService } from '../../../services/communityService';
import { zakaatService } from '../../../services/zakaatService';
import { alert } from '../../../store/alertStore';
import { logger } from '../../../utils/logger';
import type { IntendedUse } from '../../../types/zakaat.types';
import Select from '../../ui/Select';

interface Category {
	id: string;
	name: string;
	description: string;
	subcategories: { id: string; name: string }[];
}

interface IntendedUseStepProps {
	initialValue?: IntendedUse | null;
	onComplete: (data: { intendedUse: IntendedUse }) => void;
	onBack: () => void;
}

export default function IntendedUseStep({
	initialValue,
	onComplete,
	onBack,
}: IntendedUseStepProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);
	const [category, setCategory] = useState(initialValue?.category || '');
	const [subcategory, setSubcategory] = useState(initialValue?.subcategory || '');
	const [description, setDescription] = useState(initialValue?.description || '');
	const [supportingDocuments, setSupportingDocuments] = useState<string[]>(
		initialValue?.supportingDocuments || [],
	);
	const [isUploading, setIsUploading] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load categories on mount
	useEffect(() => {
		const loadCategories = async () => {
			setIsLoadingCategories(true);
			try {
				const response = await zakaatService.getCategories();
				if (response.data) {
					setCategories(response.data);
				}
			} catch (error: any) {
				logger.error('Error loading categories:', error);
				alert.error('Failed to load categories');
			} finally {
				setIsLoadingCategories(false);
			}
		};
		loadCategories();
	}, []);

	// Reset subcategory when category changes
	useEffect(() => {
		if (category) {
			setSubcategory('');
		}
	}, [category]);

	const selectedCategory = categories.find((cat) => cat.id === category);
	const subcategories = selectedCategory?.subcategories || [];

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validate file types
		const allowedTypes = [
			'image/',
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'text/plain',
		];

		const invalidFiles = files.filter(
			(file) => !allowedTypes.some((type) => file.type.includes(type))
		);

		if (invalidFiles.length > 0) {
			alert.error(
				`Invalid file type(s). Only images, PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed.`
			);
			return;
		}

		try {
			setIsUploading(true);
			const uploadPromises = files.map((file) =>
				communityService.uploadDocument(file)
			);
			const responses = await Promise.all(uploadPromises);
			const newUrls = responses.map((r) => r.data.url);
			setSupportingDocuments((prev) => [...prev, ...newUrls]);
			alert.success(`${files.length} document(s) uploaded successfully`);
		} catch (error: any) {
			logger.error('Error uploading documents:', error);
			alert.error(error.response?.data?.message || 'Failed to upload documents');
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleRemoveDocument = (index: number) => {
		setSupportingDocuments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		if (!category || !description) {
			alert.error('Please fill in all required fields');
			return;
		}
		onComplete({
			intendedUse: {
				category,
				subcategory: subcategory || undefined,
				description,
				supportingDocuments: supportingDocuments.length > 0 ? supportingDocuments : undefined,
			},
		});
	};

	return (
		<div className="space-y-6">
			<Select
				value={category}
				onChange={setCategory}
				options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
				placeholder={isLoadingCategories ? 'Loading categories...' : 'Select category'}
				label={
					<>
						Category <span className="text-red-500">*</span>
					</>
				}
				disabled={isLoadingCategories}
				searchable={true}
			/>

			{category && subcategories.length > 0 && (
				<Select
					value={subcategory}
					onChange={setSubcategory}
					options={subcategories.map((sub) => ({ value: sub.id, label: sub.name }))}
					placeholder="Select subcategory (optional)"
					label="Subcategory"
					searchable={true}
				/>
			)}

			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Description <span className="text-red-500">*</span>
				</label>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Describe how you intend to use the funds..."
					rows={5}
					className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
				/>
			</div>


			{/* Supporting Documents */}
			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Supporting Documents (Optional)
				</label>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileUpload}
					accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
					multiple
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{isUploading ? (
						<div className="w-5 h-5 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
					) : (
						<PhotoIcon className="w-5 h-5 text-slate-400" />
					)}
					<span className="text-sm text-slate-600 dark:text-slate-400">
						{isUploading ? 'Uploading...' : 'Upload Documents'}
					</span>
				</button>

				{supportingDocuments.length > 0 && (
					<div className="mt-3 grid grid-cols-2 gap-2">
						{supportingDocuments.map((url, index) => {
							const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
							const isPdf = url.match(/\.pdf$/i);
							const isDoc = url.match(/\.(doc|docx)$/i);
							const isXls = url.match(/\.(xls|xlsx)$/i);

							return (
								<div key={index} className="relative group">
									{isImage ? (
										<img
											src={url}
											alt={`Document ${index + 1}`}
											className="w-full h-32 object-cover rounded-lg"
										/>
									) : (
										<div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 p-2">
											{isPdf ? (
												<>
													<svg
														className="w-12 h-12 text-red-500"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
															clipRule="evenodd"
														/>
													</svg>
													<span className="text-xs text-slate-600 dark:text-slate-300 text-center truncate w-full">
														PDF Document
													</span>
												</>
											) : isDoc ? (
												<>
													<svg
														className="w-12 h-12 text-blue-500"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
															clipRule="evenodd"
														/>
													</svg>
													<span className="text-xs text-slate-600 dark:text-slate-300 text-center truncate w-full">
														Word Document
													</span>
												</>
											) : isXls ? (
												<>
													<svg
														className="w-12 h-12 text-green-500"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
															clipRule="evenodd"
														/>
													</svg>
													<span className="text-xs text-slate-600 dark:text-slate-300 text-center truncate w-full">
														Excel Document
													</span>
												</>
											) : (
												<>
													<svg
														className="w-12 h-12 text-slate-400"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
															clipRule="evenodd"
														/>
													</svg>
													<span className="text-xs text-slate-600 dark:text-slate-300 text-center truncate w-full">
														Document
													</span>
												</>
											)}
										</div>
									)}
									<button
										type="button"
										onClick={() => handleRemoveDocument(index)}
										className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<XMarkIcon className="w-4 h-4" />
									</button>
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
									>
										<span className="text-white text-xs font-medium">View</span>
									</a>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				<button
					onClick={onBack}
					className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Back
				</button>
				<button
					onClick={handleSubmit}
					disabled={!category || !description}
					className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
				>
					Continue
				</button>
			</div>
		</div>
	);
}

