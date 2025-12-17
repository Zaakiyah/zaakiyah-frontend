import { useState, useRef } from 'react';
import { ArrowLeftIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';
import { communityService } from '../../../services/communityService';
import { alert } from '../../../store/alertStore';
import { logger } from '../../../utils/logger';
import type { ApplicationType } from '../../../types/zakaat.types';
import Select from '../../ui/Select';
import CountrySelector from '../../ui/CountrySelector';

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

	const idFileInputRef = useRef<HTMLInputElement>(null);
	const selfieFileInputRef = useRef<HTMLInputElement>(null);

	const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert.error('Please upload an image file');
			return;
		}

		try {
			setIsUploadingId(true);
			const response = await communityService.uploadMedia(file);
			if (response.data) {
				setIdDocumentUrl(response.data.url);
				alert.success('ID document uploaded successfully');
			}
		} catch (error: any) {
			logger.error('Error uploading ID document:', error);
			alert.error('Failed to upload ID document');
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

		try {
			setIsUploadingSelfie(true);
			const response = await communityService.uploadMedia(file);
			if (response.data) {
				setSelfieUrl(response.data.url);
				alert.success('Selfie uploaded successfully');
			}
		} catch (error: any) {
			logger.error('Error uploading selfie:', error);
			alert.error('Failed to upload selfie');
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

			<div className="grid grid-cols-2 gap-3">
				<CountrySelector
					value={idCountry}
					onChange={setIdCountry}
					label="Country"
				/>
				<div>
					<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
						Region/State
					</label>
					<input
						type="text"
						value={idRegion}
						onChange={(e) => setIdRegion(e.target.value)}
						placeholder="Region/State"
						className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
					accept="image/*"
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => idFileInputRef.current?.click()}
					disabled={isUploadingId}
					className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{idDocumentUrl ? (
						<div className="space-y-2">
							<img
								src={idDocumentUrl}
								alt="ID Document"
								className="w-full h-48 object-contain rounded-lg"
							/>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								Click to change
							</p>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							{isUploadingId ? (
								<div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
							) : (
								<PhotoIcon className="w-12 h-12 text-slate-400" />
							)}
							<p className="text-sm text-slate-600 dark:text-slate-400">
								{isUploadingId ? 'Uploading...' : 'Upload ID Document'}
							</p>
						</div>
					)}
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
					className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{selfieUrl ? (
						<div className="space-y-2">
							<img
								src={selfieUrl}
								alt="Selfie"
								className="w-full h-48 object-contain rounded-lg"
							/>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								Click to change
							</p>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							{isUploadingSelfie ? (
								<div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
							) : (
								<CameraIcon className="w-12 h-12 text-slate-400" />
							)}
							<p className="text-sm text-slate-600 dark:text-slate-400">
								{isUploadingSelfie ? 'Uploading...' : 'Take or Upload Selfie'}
							</p>
						</div>
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

