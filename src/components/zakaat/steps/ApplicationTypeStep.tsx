import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ApplicationType } from '../../../types/zakaat.types';

interface ApplicationTypeStepProps {
	initialValue?: ApplicationType | null;
	onComplete: (data: { applicationType: ApplicationType }) => void;
	onBack?: () => void;
}

export default function ApplicationTypeStep({
	initialValue,
	onComplete,
	onBack,
}: ApplicationTypeStepProps) {
	const [selectedType, setSelectedType] = useState<ApplicationType | null>(initialValue || null);

	const handleContinue = () => {
		if (selectedType) {
			onComplete({ applicationType: selectedType });
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
					Apply as
				</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Select how you want to apply for Zakaat
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setSelectedType(ApplicationType.INDIVIDUAL)}
					className={`p-6 rounded-2xl border-2 transition-all text-left ${
						selectedType === ApplicationType.INDIVIDUAL
							? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
							: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-600'
					}`}
				>
					<div className="flex items-start gap-4">
						<div
							className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
								selectedType === ApplicationType.INDIVIDUAL
									? 'bg-primary-500 text-white'
									: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
							}`}
						>
							<UserIcon className="w-6 h-6" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
								Individual
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								Apply for personal Zakaat assistance
							</p>
						</div>
						{selectedType === ApplicationType.INDIVIDUAL && (
							<div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
								<svg
									className="w-4 h-4 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						)}
					</div>
				</motion.button>

				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setSelectedType(ApplicationType.ORGANIZATION)}
					className={`p-6 rounded-2xl border-2 transition-all text-left ${
						selectedType === ApplicationType.ORGANIZATION
							? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
							: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-600'
					}`}
				>
					<div className="flex items-start gap-4">
						<div
							className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
								selectedType === ApplicationType.ORGANIZATION
									? 'bg-primary-500 text-white'
									: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
							}`}
						>
							<BuildingOfficeIcon className="w-6 h-6" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
								Organization
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								Apply as an NGO or organization for Zakaat distribution
							</p>
						</div>
						{selectedType === ApplicationType.ORGANIZATION && (
							<div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
								<svg
									className="w-4 h-4 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						)}
					</div>
				</motion.button>
			</div>

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				{onBack && (
					<button
						onClick={onBack}
						className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
					>
						<ArrowLeftIcon className="w-5 h-5" />
						Back
					</button>
				)}
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={handleContinue}
					disabled={!selectedType}
					className={`${
						onBack ? 'flex-1' : 'w-full'
					} py-3 px-6 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl`}
				>
					Continue
				</motion.button>
			</div>
		</div>
	);
}
