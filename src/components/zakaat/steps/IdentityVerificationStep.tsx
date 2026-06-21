import { useState, useRef } from 'react';
import {
	ArrowLeftIcon,
	PhotoIcon,
	CameraIcon,
	DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { communityService } from '../../../services/communityService';
import { alert } from '../../../store/alertStore';
import { logger } from '../../../utils/logger';
import type { ApplicationType } from '../../../types/zakaat.types';
import Select from '../../ui/Select';
import CountrySelector from '../../ui/CountrySelector';
import Loader from '../../ui/Loader';

interface IdentityVerificationStepProps {
	applicationType?: ApplicationType;
	initialValue?: {
		idDocumentUrl?: string;
		selfieUrl?: string;
		idCountry?: string;
		idRegion?: string;
		idType?: string;
	};
	onComplete: (data: {
		idDocumentUrl?: string;
		selfieUrl?: string;
		idCountry?: string;
		idRegion?: string;
		idType?: string;
	}) => void;
	onBack: () => void;
}

const ID_TYPES = [
	{ value: 'national_id', label: 'National ID' },
	{ value: 'passport', label: 'Passport' },
	{ value: 'drivers_license', label: "Driver's License" },
	{ value: 'other', label: 'Other' },
];

export default function IdentityVerificationStep({
	initialValue,
	onComplete,
	onBack,
}: IdentityVerificationStepProps) {
	const [idType, setIdType] = useState(initialValue?.idType || '');
	const [idCountry, setIdCountry] = useState(initialValue?.idCountry || '');
	const [idRegion, setIdRegion] = useState(initialValue?.idRegion || '');
	const [idDocumentUrl, setIdDocumentUrl] = useState(initialValue?.idDocumentUrl || '');
	const [selfieUrl, setSelfieUrl] = useState(initialValue?.selfieUrl || '');
	const [isUploadingId, setIsUploadingId] = useState(false);
	const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
	const [idUploadProgress, setIdUploadProgress] = useState(0);
	const [selfieUploadProgress, setSelfieUploadProgress] = useState(0);
	const [idUploadError, setIdUploadError] = useState<string | undefined>();
	const [selfieUploadError, setSelfieUploadError] = useState<string | undefined>();
	const [idPreview, setIdPreview] = useState<string | null>(null);
	const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

	const idFileInputRef = useRef<HTMLInputElement>(null);
	const selfieFileInputRef = useRef<HTMLInputElement>(null);

	const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Allow images and documents (PDF, DOC, DOCX, etc.)
		const allowedTypes = [
			'image/',
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];
		const isValidFile = allowedTypes.some((type) => file.type.includes(type));

		if (!isValidFile) {
			alert.error('Please upload an image or document file (PDF, DOC, DOCX)');
			return;
		}

		// Create preview URL for immediate display
		const preview = URL.createObjectURL(file);
		setIdPreview(preview);
		setIdUploadError(undefined);
		setIdUploadProgress(0);

		try {
			setIsUploadingId(true);
			setIdUploadProgress(10);

			// Simulate progress (Cloudinary doesn't provide upload progress via API)
			const progressInterval = setInterval(() => {
				setIdUploadProgress((prev) => {
					if (prev < 90) {
						return Math.min(prev + 10, 90);
					}
					return prev;
				});
			}, 200);

			// Use uploadDocument for PDF/DOC files, uploadMedia for images
			const isImage = file.type.startsWith('image/');
			const response = isImage
				? await communityService.uploadMedia(file)
				: await communityService.uploadDocument(file);
			clearInterval(progressInterval);

			if (response.data?.url) {
				setIdDocumentUrl(response.data.url);
				setIdUploadProgress(100);
				// Clean up preview URL
				if (idPreview) {
					URL.revokeObjectURL(idPreview);
					setIdPreview(null);
				}
				alert.success('ID document uploaded successfully');
			}
		} catch (error: any) {
			logger.error('Error uploading ID document:', error);
			const errorMessage = error.response?.data?.message || 'Failed to upload ID document';
			setIdUploadError(errorMessage);
			setIdUploadProgress(0);
			// Clean up preview URL on error
			if (idPreview) {
				URL.revokeObjectURL(idPreview);
				setIdPreview(null);
			}
			alert.error(errorMessage);
		} finally {
			setIsUploadingId(false);
		}
	};

	const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert.error('Please upload an image file');
			return;
		}

		// Create preview URL for immediate display
		const preview = URL.createObjectURL(file);
		setSelfiePreview(preview);
		setSelfieUploadError(undefined);
		setSelfieUploadProgress(0);

		try {
			setIsUploadingSelfie(true);
			setSelfieUploadProgress(10);

			// Simulate progress (Cloudinary doesn't provide upload progress via API)
			const progressInterval = setInterval(() => {
				setSelfieUploadProgress((prev) => {
					if (prev < 90) {
						return Math.min(prev + 10, 90);
					}
					return prev;
				});
			}, 200);

			const response = await communityService.uploadMedia(file);
			clearInterval(progressInterval);

			if (response.data?.url) {
				setSelfieUrl(response.data.url);
				setSelfieUploadProgress(100);
				// Clean up preview URL
				if (selfiePreview) {
					URL.revokeObjectURL(selfiePreview);
					setSelfiePreview(null);
				}
				alert.success('Selfie uploaded successfully');
			}
		} catch (error: any) {
			logger.error('Error uploading selfie:', error);
			const errorMessage = error.response?.data?.message || 'Failed to upload selfie';
			setSelfieUploadError(errorMessage);
			setSelfieUploadProgress(0);
			// Clean up preview URL on error
			if (selfiePreview) {
				URL.revokeObjectURL(selfiePreview);
				setSelfiePreview(null);
			}
			alert.error(errorMessage);
		} finally {
			setIsUploadingSelfie(false);
		}
	};

	const handleSubmit = () => {
		if (!idType || !idDocumentUrl || !selfieUrl) {
			alert.error('Please complete all required fields');
			return;
		}
		onComplete({
			idType,
			idCountry: idCountry || undefined,
			idRegion: idRegion || undefined,
			idDocumentUrl,
			selfieUrl,
		});
	};

	return (
		<div className="space-y-6">
			<Select
				value={idType}
				onChange={setIdType}
				options={ID_TYPES.map((type) => ({ value: type.value, label: type.label }))}
				placeholder="Select ID type"
				label={
					<>
						ID Type <span className="text-red-500">*</span>
					</>
				}
			/>

			<div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
				<CountrySelector value={idCountry} onChange={setIdCountry} label="Country" />
				<div>
					<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
						Region/State
					</label>
					<input
						type="text"
						value={idRegion}
						onChange={(e) => setIdRegion(e.target.value)}
						placeholder="Region/State"
						className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 dark:focus-visible:ring-primary-400/20 focus-visible:border-primary-500 dark:focus-visible:border-primary-400 transition-all shadow-sm hover:shadow-md focus:shadow-lg hover:border-slate-300 dark:hover:border-slate-600"
					/>
				</div>
			</div>

			{/* ID Document Upload */}
			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					ID Document <span className="text-red-500">*</span>
				</label>
				<input
					type="file"
					ref={idFileInputRef}
					onChange={handleIdUpload}
					accept="image/*,.pdf,.doc,.docx"
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => idFileInputRef.current?.click()}
					disabled={isUploadingId}
					className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
				>
					{idDocumentUrl || idPreview ? (
						<div className="space-y-2">
							{idDocumentUrl && idDocumentUrl.endsWith('.pdf') ? (
								<div className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
									<DocumentTextIcon className="w-16 h-16 text-slate-400" />
								</div>
							) : (
								<img
									src={idDocumentUrl || idPreview || ''}
									alt="ID Document"
									className="w-full h-48 object-contain rounded-lg"
								/>
							)}
							{isUploadingId && (
								<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
									<div
										className="bg-primary-500 h-2 rounded-full transition-all duration-300"
										style={{ width: `${idUploadProgress}%` }}
									/>
								</div>
							)}
							<p className="text-sm text-slate-600 dark:text-slate-400">
								{isUploadingId
									? `Uploading... ${idUploadProgress}%`
									: 'Click to change'}
							</p>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							{isUploadingId ? (
								<>
									<Loader size="lg" />
									<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
										<div
											className="bg-primary-500 h-2 rounded-full transition-all duration-300"
											style={{ width: `${idUploadProgress}%` }}
										/>
									</div>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										Uploading... {idUploadProgress}%
									</p>
								</>
							) : (
								<>
									<PhotoIcon className="w-12 h-12 text-slate-400" />
									<p className="text-sm text-slate-600 dark:text-slate-400">
										Upload ID Document
									</p>
								</>
							)}
						</div>
					)}
					{idUploadError && <p className="text-xs text-red-500 mt-2">{idUploadError}</p>}
				</button>
			</div>

			{/* Selfie Upload */}
			<div>
				<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
					Selfie Photo <span className="text-red-500">*</span>
				</label>
				<input
					type="file"
					ref={selfieFileInputRef}
					onChange={handleSelfieUpload}
					accept="image/*"
					capture="user"
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => selfieFileInputRef.current?.click()}
					disabled={isUploadingSelfie}
					className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
				>
					{selfieUrl || selfiePreview ? (
						<div className="space-y-2">
							<img
								src={selfieUrl || selfiePreview || ''}
								alt="Selfie"
								className="w-full h-48 object-contain rounded-lg"
							/>
							{isUploadingSelfie && (
								<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
									<div
										className="bg-primary-500 h-2 rounded-full transition-all duration-300"
										style={{ width: `${selfieUploadProgress}%` }}
									/>
								</div>
							)}
							<p className="text-sm text-slate-600 dark:text-slate-400">
								{isUploadingSelfie
									? `Uploading... ${selfieUploadProgress}%`
									: 'Click to change'}
							</p>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							{isUploadingSelfie ? (
								<>
									<Loader size="lg" />
									<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
										<div
											className="bg-primary-500 h-2 rounded-full transition-all duration-300"
											style={{ width: `${selfieUploadProgress}%` }}
										/>
									</div>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										Uploading... {selfieUploadProgress}%
									</p>
								</>
							) : (
								<>
									<CameraIcon className="w-12 h-12 text-slate-400" />
									<p className="text-sm text-slate-600 dark:text-slate-400">
										Take or Upload Selfie
									</p>
								</>
							)}
						</div>
					)}
					{selfieUploadError && (
						<p className="text-xs text-red-500 mt-2">{selfieUploadError}</p>
					)}
				</button>
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
					disabled={!idType || !idDocumentUrl || !selfieUrl}
					className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
				>
					Continue
				</button>
			</div>
		</div>
	);
}
