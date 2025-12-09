import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useWealthCalculationStore } from '../store/wealthCalculationStore';
import { useCurrencyStore } from '../store/currencyStore';
import CalculationProgress from '../components/wealth/CalculationProgress';
import WelcomeStep from '../components/wealth/steps/WelcomeStep';
import AssetInputStep from '../components/wealth/steps/AssetInputStep';
import LiabilityInputStep from '../components/wealth/steps/LiabilityInputStep';
import NisaabSelectionStep from '../components/wealth/steps/NisaabSelectionStep';
import CalculationResultsStep from '../components/wealth/steps/CalculationResultsStep';
import SavePreferencesStep from '../components/wealth/steps/SavePreferencesStep';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { alert } from '../store/alertStore';

/**
 * Wealth Calculation Page
 * Main entry point for the wealth calculation feature
 */
export default function WealthCalculationPage() {
	useTheme();
	const navigate = useNavigate();
	const {
		currentStep,
		loadDraft,
		goToNextStep,
		goToPreviousStep,
		resetWizard: reset,
	} = useWealthCalculationStore();
	const { syncWithUserProfile } = useCurrencyStore();

	useEffect(() => {
		// Sync currency with user profile (base currency for all calculations)
		syncWithUserProfile();
		// Load draft on mount if available
		loadDraft();
	}, [loadDraft, syncWithUserProfile]);

	const handleBack = () => {
		if (currentStep === 'welcome') {
			navigate('/dashboard');
		} else {
			goToPreviousStep();
		}
	};

	const handleComplete = () => {
		alert.success('Calculation saved successfully!');
		reset();
		navigate('/dashboard');
	};

	const renderStep = () => {
		switch (currentStep) {
			case 'welcome':
				return <WelcomeStep onNext={goToNextStep} />;
			case 'assets':
				return <AssetInputStep onNext={goToNextStep} onBack={goToPreviousStep} />;
			case 'liabilities':
				return <LiabilityInputStep onNext={goToNextStep} onBack={goToPreviousStep} />;
			case 'nisaab':
				return <NisaabSelectionStep onNext={goToNextStep} onBack={goToPreviousStep} />;
			case 'results':
				return <CalculationResultsStep onNext={goToNextStep} onBack={goToPreviousStep} />;
			case 'save':
				return <SavePreferencesStep onComplete={handleComplete} onBack={goToPreviousStep} />;
			default:
				return (
					<div className="text-center py-8">
						<p className="text-sm text-slate-600 dark:text-slate-400">Unknown step</p>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
			{/* Header */}
			<header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-sm">
				<div className="px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={handleBack}
							className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
							aria-label="Go back"
							type="button"
						>
							<ArrowLeftIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
						</button>
						<div>
							<h1 className="text-lg font-bold text-slate-900 dark:text-slate-100" id="page-title">
								Wealth Calculation
							</h1>
							<p className="text-xs text-slate-500 dark:text-slate-400" aria-describedby="page-title">
								Calculate your Zakaat eligibility
							</p>
						</div>
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
					{/* Progress Indicator */}
					<CalculationProgress currentStep={currentStep} />

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
		</div>
	);
}

