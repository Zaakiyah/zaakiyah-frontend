import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { ApplicationFormData } from '../../../pages/zakaat/ZakaatApplicationFlowPage';

interface ReviewStepProps {
	formData: ApplicationFormData;
	onSubmit: () => void;
	onBack: () => void;
	isSubmitting: boolean;
}

export default function ReviewStep({ formData, onSubmit, onBack, isSubmitting }: ReviewStepProps) {
	const isIndividual = formData.applicationType === 'individual';

	return (
		<div className="space-y-6">
			<div className="bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 rounded-xl p-4">
				<div className="flex items-start gap-3">
					<CheckCircleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">
							Review Your Application
						</h3>
						<p className="text-sm text-primary-700 dark:text-primary-300">
							Please review all information before submitting. You can go back to edit
							any section.
						</p>
					</div>
				</div>
			</div>

			{/* Application Type */}
			<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
				<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
					Application Type
				</h4>
				<p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
					{formData.applicationType}
				</p>
			</div>

			{/* Eligibility */}
			{formData.eligibility && (
				<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
					<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
						Amount Requested
					</h4>
					<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
						<p>{formData.eligibility.requestedAmount.toLocaleString()}</p>
					</div>
				</div>
			)}

			{/* Personal/Organization Info */}
			{formData.personalInfo && (
				<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
					<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
						{isIndividual ? 'Personal Information' : 'Organization Information'}
					</h4>
					<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
						{isIndividual ? (
							<>
								<p>
									Name: {(formData.personalInfo as any).firstName}{' '}
									{(formData.personalInfo as any).lastName}
								</p>
								<p>Email: {(formData.personalInfo as any).email}</p>
								<p>Phone: {(formData.personalInfo as any).phoneNumber}</p>
							</>
						) : (
							<>
								<p>Name: {(formData.personalInfo as any).organizationName}</p>
								<p>
									Registration:{' '}
									{(formData.personalInfo as any).registrationNumber}
								</p>
								<p>Type: {(formData.personalInfo as any).organizationType}</p>
							</>
						)}
					</div>
				</div>
			)}

			{/* Identity Verification */}
			{formData.identityVerification.idDocumentUrl && (
				<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
					<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
						Identity Verification
					</h4>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						ID Type: {formData.identityVerification.idType}
					</p>
				</div>
			)}

			{/* Financial Info (for organizations) */}
			{formData.financialInfo && (
				<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
					<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
						Financial Information
					</h4>
					<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
						{formData.financialInfo.businessRevenue && (
							<p>
								Revenue: ${formData.financialInfo.businessRevenue.toLocaleString()}
							</p>
						)}
						{formData.financialInfo.netProfit && (
							<p>Net Profit: ${formData.financialInfo.netProfit.toLocaleString()}</p>
						)}
					</div>
				</div>
			)}

			{/* Intended Use */}
			{formData.intendedUse && (
				<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
					<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
						Intended Use of Funds
					</h4>
					<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
						<p>Category: {formData.intendedUse.category}</p>
						{formData.intendedUse.subcategory && (
							<p>Subcategory: {formData.intendedUse.subcategory}</p>
						)}
						<p className="mt-2">{formData.intendedUse.description}</p>
					</div>
				</div>
			)}

			{/* Bank Details */}
			{formData.bankDetails && (
				<div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
					<h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
						Bank Details
					</h4>
					<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
						<p>Bank: {formData.bankDetails.bankName}</p>
						<p>Account: {formData.bankDetails.accountNumber}</p>
						<p>Name: {formData.bankDetails.accountName}</p>
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				<button
					onClick={onBack}
					disabled={isSubmitting}
					className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Back
				</button>
				<button
					onClick={onSubmit}
					disabled={isSubmitting}
					className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
				>
					{isSubmitting ? (
						<>
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<CheckCircleIcon className="w-5 h-5" />
							Submit
						</>
					)}
				</button>
			</div>
		</div>
	);
}
