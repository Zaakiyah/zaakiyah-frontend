import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { zakaatService } from '../../services/zakaatService';
import { alert } from '../../store/alertStore';
import { logger } from '../../utils/logger';
import ZakaatApplicationProgress from '../../components/zakaat/ZakaatApplicationProgress';
import WelcomeStep from '../../components/zakaat/steps/WelcomeStep';
import ApplicationTypeStep from '../../components/zakaat/steps/ApplicationTypeStep';
import EligibilityCheckStep from '../../components/zakaat/steps/EligibilityCheckStep';
import PersonalInfoStep from '../../components/zakaat/steps/PersonalInfoStep';
import IdentityVerificationStep from '../../components/zakaat/steps/IdentityVerificationStep';
import FinancialInfoStep from '../../components/zakaat/steps/FinancialInfoStep';
import IntendedUseStep from '../../components/zakaat/steps/IntendedUseStep';
import BankDetailsStep from '../../components/zakaat/steps/BankDetailsStep';
import ReviewStep from '../../components/zakaat/steps/ReviewStep';
import type {
	ApplicationType,
	PersonalInfo,
	OrganizationInfo,
	FinancialInfo,
	IntendedUse,
	BankDetails,
	EligibilityCheckRequest,
} from '../../types/zakaat.types';
import { ApplicationStatus } from '../../types/zakaat.types';

export interface ApplicationFormData {
	applicationType: ApplicationType | null;
	eligibility: EligibilityCheckRequest | null;
	personalInfo: PersonalInfo | OrganizationInfo | null;
	identityVerification: {
		idDocumentUrl?: string;
		selfieUrl?: string;
		idCountry?: string;
		idRegion?: string;
		idType?: string;
	};
	financialInfo: FinancialInfo | null;
	intendedUse: IntendedUse | null;
	bankDetails: BankDetails | null;
	supportingDocuments: string[];
}

const TOTAL_STEPS = 9; // Welcome (0) + 8 form steps

export default function ZakaatApplicationFlowPage() {
	useTheme();
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();
	const [searchParams] = useSearchParams();
	const isNewApplication = searchParams.get('new') === 'true';

	const [currentStep, setCurrentStep] = useState(0); // Start at welcome step
	const [applicationId, setApplicationId] = useState<string | null>(id || null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [formData, setFormData] = useState<ApplicationFormData>({
		applicationType: null,
		eligibility: null,
		personalInfo: null,
		identityVerification: {},
		financialInfo: null,
		intendedUse: null,
		bankDetails: null,
		supportingDocuments: [],
	});

	// Load existing application if editing, or check for draft if no ID
	useEffect(() => {
		if (applicationId) {
			loadApplication();
		} else if (!isNewApplication) {
			// Check for existing draft application only if not explicitly creating new
			checkForDraft();
		}
	}, [applicationId, isNewApplication]);

	const checkForDraft = async () => {
		try {
			const response = await zakaatService.getApplications({
				status: ApplicationStatus.DRAFT,
				limit: 1,
			});
			if (response.data && response.data.data.length > 0) {
				const draft = response.data.data[0];
				// Navigate to the draft application
				navigate(`/zakaat/apply/${draft.id}`, { replace: true });
			}
		} catch (error: any) {
			logger.error('Error checking for draft:', error);
			// Silently fail - user can start fresh
		}
	};

	const loadApplication = async () => {
		if (!applicationId) return;

		try {
			setIsLoading(true);
			const response = await zakaatService.getApplicationById(applicationId);
			if (response.data) {
				const app = response.data;
				setFormData({
					applicationType: app.applicationType as ApplicationType,
					eligibility: app.requestedAmount
						? {
								requestedAmount: app.requestedAmount,
						  }
						: null,
					personalInfo: app.personalInfo as PersonalInfo | OrganizationInfo | null,
					identityVerification: {
						idDocumentUrl: app.idDocumentUrl,
						selfieUrl: app.selfieUrl,
						idCountry: app.idCountry,
						idRegion: app.idRegion,
						idType: app.idType,
					},
					financialInfo: app.financialInfo as FinancialInfo | null,
					intendedUse: app.intendedUse as IntendedUse | null,
					bankDetails: app.bankName
						? {
								bankName: app.bankName,
								accountNumber: app.accountNumber || '',
								accountName: app.accountName || '',
						  }
						: null,
					supportingDocuments: app.supportingDocuments || [],
				});

				// Determine current step based on filled data (skip welcome for existing apps)
				// Steps: 0=welcome, 1=type, 2=eligibility, 3=personalInfo, 4=identity, 5=financial, 6=intendedUse, 7=bankDetails, 8=review
				if (app.accountName && app.bankName) {
					setCurrentStep(8); // Review step
				} else if (app.intendedUse) {
					setCurrentStep(7); // Bank details step
				} else if (app.applicationType === 'organization' && app.financialInfo) {
					setCurrentStep(6); // Intended use step (after financial)
				} else if (app.applicationType === 'individual' && app.idDocumentUrl) {
					setCurrentStep(6); // Intended use step (skip financial for individuals)
				} else if (app.applicationType === 'organization' && app.idDocumentUrl) {
					setCurrentStep(5); // Financial step (for organizations)
				} else if (app.idDocumentUrl) {
					setCurrentStep(4); // Identity step
				} else if (app.personalInfo) {
					setCurrentStep(3); // Personal info step
				} else if (app.requestedAmount) {
					setCurrentStep(2); // Eligibility step
				} else if (app.applicationType) {
					setCurrentStep(1); // Type step
				} else {
					setCurrentStep(0); // Welcome step
				}
			}
		} catch (error: any) {
			logger.error('Error loading application:', error);
			alert.error('Failed to load application');
			navigate('/zakaat/applications');
		} finally {
			setIsLoading(false);
		}
	};

	const handleStepComplete = async (stepData: Partial<ApplicationFormData>) => {
		setFormData((prev) => ({ ...prev, ...stepData }));

		// Auto-save to backend if we have an application ID
		if (applicationId) {
			await saveApplication(stepData);
		} else if (currentStep === 1 && stepData.applicationType) {
			// Create application after type selection (step 1)
			await createApplication(stepData);
		}
	};

	const createApplication = async (stepData: Partial<ApplicationFormData>) => {
		try {
			setIsSaving(true);
			const response = await zakaatService.createApplication({
				applicationType: stepData.applicationType!,
			});
			if (response.data) {
				setApplicationId(response.data.id);
				alert.success('Application created');
			}
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || 'Failed to create application';
			alert.error(errorMessage);
			// If user has active application, redirect to applications page
			if (errorMessage.includes('active application')) {
				navigate('/zakaat/applications');
			}
		} finally {
			setIsSaving(false);
		}
	};

	const saveApplication = async (stepData: Partial<ApplicationFormData>) => {
		if (!applicationId) return;

		try {
			setIsSaving(true);
			const updateData: any = {};

			if (stepData.applicationType) updateData.applicationType = stepData.applicationType;
			if (stepData.eligibility) {
				updateData.requestedAmount = stepData.eligibility.requestedAmount;
			}
			if (stepData.personalInfo) {
				if (formData.applicationType === 'individual') {
					updateData.personalInfo = stepData.personalInfo;
				} else {
					updateData.organizationInfo = stepData.personalInfo;
				}
			}
			if (stepData.identityVerification) {
				updateData.idDocumentUrl = stepData.identityVerification.idDocumentUrl;
				updateData.selfieUrl = stepData.identityVerification.selfieUrl;
				updateData.idCountry = stepData.identityVerification.idCountry;
				updateData.idRegion = stepData.identityVerification.idRegion;
				updateData.idType = stepData.identityVerification.idType;
			}
			if (stepData.financialInfo) updateData.financialInfo = stepData.financialInfo;
			if (stepData.intendedUse) updateData.intendedUse = stepData.intendedUse;
			if (stepData.bankDetails) updateData.bankDetails = stepData.bankDetails;
			if (stepData.supportingDocuments)
				updateData.supportingDocuments = stepData.supportingDocuments;

			await zakaatService.updateApplication(applicationId, updateData);
		} catch (error: any) {
			logger.error('Error saving application:', error);
			alert.error(error.response?.data?.message || 'Failed to save application');
		} finally {
			setIsSaving(false);
		}
	};

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep === 0) {
			// On welcome step, go back to dashboard
			navigate('/dashboard');
		} else if (currentStep > 0) {
			let prevStep = currentStep - 1;

			// Skip financial step for individuals when going back
			if (prevStep === 5 && formData.applicationType === 'individual') {
				prevStep = 4;
			}

			setCurrentStep(prevStep);
		}
	};

	const handleCancel = () => {
		if (applicationId) {
			// If there's a draft, go to applications page
			navigate('/zakaat/applications');
		} else {
			// If no draft, go to dashboard
			navigate('/dashboard');
		}
	};

	const handleSubmit = async () => {
		if (!applicationId) {
			alert.error('Please complete all steps before submitting');
			return;
		}

		// Validate required fields before submission
		const errors: string[] = [];
		if (!formData.personalInfo) {
			errors.push('Personal/Organization information');
		}
		if (!formData.intendedUse) {
			errors.push('Intended use of funds');
		}
		if (
			!formData.bankDetails ||
			!formData.bankDetails.bankName ||
			!formData.bankDetails.accountNumber ||
			!formData.bankDetails.accountName
		) {
			errors.push('Bank details');
		}
		if (
			!formData.identityVerification.idDocumentUrl ||
			!formData.identityVerification.selfieUrl
		) {
			errors.push('Identity verification documents');
		}
		if (formData.applicationType === 'organization' && !formData.financialInfo) {
			errors.push('Financial information');
		}

		if (errors.length > 0) {
			alert.error(`Please complete: ${errors.join(', ')}`);
			return;
		}

		try {
			setIsLoading(true);
			await zakaatService.submitApplication(applicationId);
			alert.success('Application submitted successfully!');
			navigate('/zakaat/applications');
		} catch (error: any) {
			alert.error(error.response?.data?.message || 'Failed to submit application');
		} finally {
			setIsLoading(false);
		}
	};

	const getCurrentStepName = ():
		| 'welcome'
		| 'type'
		| 'eligibility'
		| 'personalInfo'
		| 'identity'
		| 'financial'
		| 'intendedUse'
		| 'bankDetails'
		| 'review' => {
		switch (currentStep) {
			case 0:
				return 'welcome';
			case 1:
				return 'type';
			case 2:
				return 'eligibility';
			case 3:
				return 'personalInfo';
			case 4:
				return 'identity';
			case 5:
				return 'financial';
			case 6:
				return 'intendedUse';
			case 7:
				return 'bankDetails';
			case 8:
				return 'review';
			default:
				return 'welcome';
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return <WelcomeStep onNext={handleNext} />;
			case 1:
				return (
					<ApplicationTypeStep
						initialValue={formData.applicationType}
						onComplete={(data) => {
							handleStepComplete(data);
							handleNext();
						}}
						onBack={handlePrevious}
					/>
				);
			case 2:
				return (
					<EligibilityCheckStep
						initialValue={formData.eligibility}
						onComplete={(data) => {
							handleStepComplete(data);
							handleNext();
						}}
						onBack={handlePrevious}
					/>
				);
			case 3:
				return (
					<PersonalInfoStep
						applicationType={formData.applicationType!}
						initialValue={formData.personalInfo}
						onComplete={(data) => {
							handleStepComplete(data);
							handleNext();
						}}
						onBack={handlePrevious}
					/>
				);
			case 4:
				return (
					<IdentityVerificationStep
						applicationType={formData.applicationType!}
						initialValue={formData.identityVerification}
						onComplete={(data) => {
							handleStepComplete({ identityVerification: data });
							handleNext();
						}}
						onBack={handlePrevious}
					/>
				);
			case 5:
				if (formData.applicationType === 'organization') {
					return (
						<FinancialInfoStep
							initialValue={formData.financialInfo}
							onComplete={(data) => {
								handleStepComplete({ financialInfo: data.financialInfo });
								handleNext();
							}}
							onBack={handlePrevious}
						/>
					);
				} else {
					// Skip financial step for individuals
					setCurrentStep(6);
					return null;
				}
			case 6:
				return (
					<IntendedUseStep
						initialValue={formData.intendedUse}
						onComplete={(data) => {
							handleStepComplete({ intendedUse: data.intendedUse });
							handleNext();
						}}
						onBack={handlePrevious}
					/>
				);
			case 7:
				return (
					<BankDetailsStep
						initialValue={formData.bankDetails}
						onComplete={(data) => {
							handleStepComplete({ bankDetails: data.bankDetails });
							handleNext();
						}}
						onBack={handlePrevious}
					/>
				);
			case 8:
				return (
					<ReviewStep
						formData={formData}
						onSubmit={handleSubmit}
						onBack={handlePrevious}
						isSubmitting={isLoading}
					/>
				);
			default:
				return null;
		}
	};

	if (isLoading && !formData.applicationType) {
		return (
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-slate-600 dark:text-slate-400">Loading application...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<button
								onClick={handlePrevious}
								className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
								aria-label="Go back"
								type="button"
							>
								<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
							</button>
							<div>
								<h1
									className="text-lg font-bold text-slate-900 dark:text-slate-100"
									id="page-title"
								>
									Zakaat Application
								</h1>
								<p
									className="text-xs text-slate-500 dark:text-slate-400"
									aria-describedby="page-title"
								>
									Apply for Zakaat assistance
								</p>
							</div>
						</div>
						<button
							onClick={handleCancel}
							className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
							aria-label="Cancel"
							type="button"
						>
							<XMarkIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="px-4 py-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="max-w-2xl mx-auto"
				>
					{/* Progress Indicator - Hide on welcome step */}
					{currentStep > 0 && (
						<ZakaatApplicationProgress
							currentStep={getCurrentStepName()}
							applicationType={formData.applicationType}
						/>
					)}

					{/* Step Content */}
					<AnimatePresence mode="wait">
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2, ease: 'easeInOut' }}
							className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-visible"
						>
							{renderStep()}
						</motion.div>
					</AnimatePresence>
				</motion.div>
			</main>

			{/* Saving Indicator */}
			{isSaving && (
				<div className="fixed bottom-20 left-0 right-0 px-4 z-50">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="max-w-md mx-auto bg-primary-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
					>
						<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
						<span className="text-sm font-medium">Saving your progress...</span>
					</motion.div>
				</div>
			)}
		</div>
	);
}
