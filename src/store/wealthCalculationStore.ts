import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
	Asset,
	Liability,
	NisaabBase,
	WealthCalculation,
	WizardStep,
	CalculationFormState,
	CalculationResult,
	NisaabData,
	NotificationPreferences,
	ValidationMessage,
} from '../types/wealth.types';
import { performCalculation } from '../utils/wealthCalculation';
import { validateCalculationForm } from '../utils/wealthValidation';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface WealthCalculationState {
	// Wizard state
	currentStep: WizardStep;
	steps: WizardStep[];

	// Form data (draft)
	formState: CalculationFormState;

	// Current calculation result
	calculationResult: CalculationResult | null;

	// Nisaab data
	nisaabData: NisaabData | null;

	// Validation
	validationErrors: ValidationMessage[];
	validationWarnings: ValidationMessage[];

	// Saved calculations
	savedCalculations: WealthCalculation[];

	// Loading states
	isLoading: boolean;
	isCalculating: boolean;
	isSaving: boolean;

	// Draft auto-save
	lastSavedDraft: number | null;

	// ============================================================================
	// WIZARD ACTIONS
	// ============================================================================

	setStep: (step: WizardStep) => void;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
	resetWizard: () => void;

	// ============================================================================
	// ASSET ACTIONS
	// ============================================================================

	addAsset: (asset: Asset) => void;
	updateAsset: (id: string, updates: Partial<Asset>) => void;
	removeAsset: (id: string) => void;
	clearAssets: () => void;

	// ============================================================================
	// LIABILITY ACTIONS
	// ============================================================================

	addLiability: (liability: Liability) => void;
	updateLiability: (id: string, updates: Partial<Liability>) => void;
	removeLiability: (id: string) => void;
	clearLiabilities: () => void;

	// ============================================================================
	// NISAAB ACTIONS
	// ============================================================================

	setNisaabBase: (base: NisaabBase) => void;
	setNisaabData: (data: NisaabData) => void;

	// ============================================================================
	// CALCULATION ACTIONS
	// ============================================================================

	calculate: () => void;
	setCalculationResult: (result: CalculationResult) => void;
	clearCalculation: () => void;

	// ============================================================================
	// VALIDATION ACTIONS
	// ============================================================================

	setValidationErrors: (errors: ValidationMessage[]) => void;
	setValidationWarnings: (warnings: ValidationMessage[]) => void;
	clearValidation: () => void;

	// ============================================================================
	// SAVE ACTIONS
	// ============================================================================

	setSavePreference: (save: boolean) => void;
	setCalculationName: (name: string) => void;
	setNotificationPreferences: (prefs: NotificationPreferences) => void;
	saveCalculation: () => Promise<void>;
	loadDraft: () => void;
	saveDraft: () => void;
	clearDraft: () => void;

	// ============================================================================
	// SAVED CALCULATIONS ACTIONS
	// ============================================================================

	loadSavedCalculations: () => Promise<void>;
	getCalculationById: (id: string) => WealthCalculation | null;
	deleteCalculation: (id: string) => Promise<void>;
	archiveCalculation: (id: string) => Promise<void>;
	unarchiveCalculation: (id: string) => Promise<void>;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const steps: WizardStep[] = ['welcome', 'assets', 'liabilities', 'nisaab', 'results', 'save'];

const initialFormState: CalculationFormState = {
	assets: [],
	liabilities: [],
	nisaabBase: null,
	selectedNisaabData: null,
	saveCalculation: false,
	calculationName: undefined,
	notificationPreferences: undefined,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useWealthCalculationStore = create<WealthCalculationState>()(
	persist(
		(set, get) => ({
			// Initial state
			currentStep: 'welcome',
			steps,
			formState: initialFormState,
			calculationResult: null,
			nisaabData: null,
			validationErrors: [],
			validationWarnings: [],
			savedCalculations: [],
			isLoading: false,
			isCalculating: false,
			isSaving: false,
			lastSavedDraft: null,

			// ============================================================================
			// WIZARD ACTIONS
			// ============================================================================

			setStep: (step) => {
				const targetIndex = steps.indexOf(step);

				if (targetIndex === -1) return;

				set({ currentStep: step });
				get().saveDraft(); // Auto-save on step change
			},

			goToNextStep: () => {
				const currentIndex = steps.indexOf(get().currentStep);
				if (currentIndex < steps.length - 1) {
					const nextStep = steps[currentIndex + 1];
					get().setStep(nextStep);
				}
			},

			goToPreviousStep: () => {
				const currentIndex = steps.indexOf(get().currentStep);
				if (currentIndex > 0) {
					const prevStep = steps[currentIndex - 1];
					get().setStep(prevStep);
				}
			},

			resetWizard: () => {
				set({
					currentStep: 'welcome',
					formState: initialFormState,
					calculationResult: null,
					validationErrors: [],
					validationWarnings: [],
				});
				get().clearDraft();
			},

			// ============================================================================
			// ASSET ACTIONS
			// ============================================================================

			addAsset: (asset) => {
				set((state) => ({
					formState: {
						...state.formState,
						assets: [...state.formState.assets, asset],
					},
				}));
				get().saveDraft();
			},

			updateAsset: (id, updates) => {
				set((state) => ({
					formState: {
						...state.formState,
						assets: state.formState.assets.map((asset) => {
							if (asset.id === id) {
								const updated = { ...asset, ...updates } as Asset;
								// If currency changed or amount changed, recalculate converted amount
								// (Currency conversion will be handled by CurrencyInput component)
								return updated;
							}
							return asset;
						}),
					},
				}));
				get().saveDraft();
			},

			removeAsset: (id) => {
				set((state) => ({
					formState: {
						...state.formState,
						assets: state.formState.assets.filter((asset) => asset.id !== id),
					},
				}));
				get().saveDraft();
			},

			clearAssets: () => {
				set((state) => ({
					formState: {
						...state.formState,
						assets: [],
					},
				}));
				get().saveDraft();
			},

			// ============================================================================
			// LIABILITY ACTIONS
			// ============================================================================

			addLiability: (liability) => {
				set((state) => ({
					formState: {
						...state.formState,
						liabilities: [...state.formState.liabilities, liability],
					},
				}));
				get().saveDraft();
			},

			updateLiability: (id, updates) => {
				set((state) => ({
					formState: {
						...state.formState,
						liabilities: state.formState.liabilities.map((liability) => {
							if (liability.id === id) {
								const updated = { ...liability, ...updates } as Liability;
								// If currency changed or amount changed, recalculate converted amount
								// (Currency conversion will be handled by CurrencyInput component)
								return updated;
							}
							return liability;
						}),
					},
				}));
				get().saveDraft();
			},

			removeLiability: (id) => {
				set((state) => ({
					formState: {
						...state.formState,
						liabilities: state.formState.liabilities.filter(
							(liability) => liability.id !== id
						),
					},
				}));
				get().saveDraft();
			},

			clearLiabilities: () => {
				set((state) => ({
					formState: {
						...state.formState,
						liabilities: [],
					},
				}));
				get().saveDraft();
			},

			// ============================================================================
			// NISAAB ACTIONS
			// ============================================================================

			setNisaabBase: (base) => {
				set((state) => ({
					formState: {
						...state.formState,
						nisaabBase: base,
					},
				}));
				get().saveDraft();
			},

			setNisaabData: (data) => {
				set({ nisaabData: data });
				set((state) => ({
					formState: {
						...state.formState,
						selectedNisaabData: data,
					},
				}));
			},

			// ============================================================================
			// CALCULATION ACTIONS
			// ============================================================================

			calculate: () => {
				const state = get();
				const { formState, nisaabData } = state;

				if (!formState.nisaabBase || !nisaabData) {
					console.error('Nisaab base or data not available for calculation');
					return;
				}

				set({ isCalculating: true });

				try {
					// Validate form before calculation
					const validation = validateCalculationForm(formState.assets, formState.liabilities);
					
					// Set validation state
					set({
						validationErrors: validation.errors,
						validationWarnings: validation.warnings,
					});

					// If there are blocking errors, don't calculate
					if (!validation.isValid) {
						set({ isCalculating: false });
						return;
					}

					// Perform calculation using utility function
					const result = performCalculation(
						formState.assets,
						formState.liabilities,
						formState.nisaabBase,
						nisaabData
					);

					set({ calculationResult: result, isCalculating: false });
				} catch (error) {
					console.error('Error calculating wealth:', error);
					set({ isCalculating: false });
				}
			},

			setCalculationResult: (result) => {
				set({ calculationResult: result });
			},

			clearCalculation: () => {
				set({ calculationResult: null });
			},

			// ============================================================================
			// VALIDATION ACTIONS
			// ============================================================================

			setValidationErrors: (errors) => {
				set({ validationErrors: errors });
			},

			setValidationWarnings: (warnings) => {
				set({ validationWarnings: warnings });
			},

			clearValidation: () => {
				set({ validationErrors: [], validationWarnings: [] });
			},

			// ============================================================================
			// SAVE ACTIONS
			// ============================================================================

			setSavePreference: (save) => {
				set((state) => ({
					formState: {
						...state.formState,
						saveCalculation: save,
					},
				}));
			},

			setCalculationName: (name) => {
				set((state) => ({
					formState: {
						...state.formState,
						calculationName: name,
					},
				}));
			},

			setNotificationPreferences: (prefs) => {
				set((state) => ({
					formState: {
						...state.formState,
						notificationPreferences: prefs,
					},
				}));
			},

			saveCalculation: async () => {
				const state = get();
				const { formState, nisaabData } = state;

				if (!nisaabData) {
					console.error('Nisaab data not available');
					return;
				}

				set({ isSaving: true });

				try {
					const { wealthCalculationService } = await import('../services/wealthCalculationService');

					// Prepare calculation data
					const calculationData: Omit<WealthCalculation, 'id' | 'createdAt' | 'updatedAt'> = {
						userId: 'current-user-id', // Backend will use authenticated user
						name: formState.calculationName || undefined,
						assets: formState.assets,
						totalAssets: state.calculationResult?.totalAssets || 0,
						liabilities: formState.liabilities,
						totalLiabilities: state.calculationResult?.totalLiabilities || 0,
						netWorth: state.calculationResult?.netWorth || 0,
						nisaabBase: formState.nisaabBase!,
						nisaabThreshold: state.calculationResult?.nisaabThreshold || 0,
						meetsNisaab: state.calculationResult?.meetsNisaab || false,
						zakatDue: state.calculationResult?.zakatDue || null,
						zakatRate: 2.5,
						goldNisaabValue: nisaabData.goldNisaabValue,
						silverNisaabValue: nisaabData.silverNisaabValue,
						currency: nisaabData.currency || 'USD',
						nisaabDataUsed: {
							goldNisaabValue: nisaabData.goldNisaabValue,
							silverNisaabValue: nisaabData.silverNisaabValue,
							goldPricePerGram: nisaabData.goldPricePerGram,
							silverPricePerGram: nisaabData.silverPricePerGram,
							currency: nisaabData.currency,
							date: nisaabData.date || new Date().toISOString(),
						},
						status: 'active',
						// Notification preferences will be converted to flat structure in the service
						calculationDate: new Date().toISOString(),
					};

					// Call API
					const response = await wealthCalculationService.saveCalculation(calculationData);

					// Add to saved calculations list
					set({
						savedCalculations: [...state.savedCalculations, response.data],
						isSaving: false,
					});
				} catch (error) {
					console.error('Error saving calculation:', error);
					set({ isSaving: false });
					throw error;
				}
			},

			loadDraft: () => {
				try {
					const draft = localStorage.getItem('wealth-calculation-draft');
					if (draft) {
						const parsed = JSON.parse(draft);
						set({ formState: parsed });
					}
				} catch (error) {
					console.error('Failed to load draft:', error);
				}
			},

			saveDraft: () => {
				try {
					const draft = JSON.stringify(get().formState);
					localStorage.setItem('wealth-calculation-draft', draft);
					set({ lastSavedDraft: Date.now() });
				} catch (error) {
					console.error('Failed to save draft:', error);
				}
			},

			clearDraft: () => {
				localStorage.removeItem('wealth-calculation-draft');
				set({ lastSavedDraft: null });
			},

			// ============================================================================
			// SAVED CALCULATIONS ACTIONS (Placeholder - will implement in Phase 6)
			// ============================================================================

			loadSavedCalculations: async () => {
				set({ isLoading: true });
				try {
					const { wealthCalculationService } = await import('../services/wealthCalculationService');
					const response = await wealthCalculationService.getCalculations(1, 50);
					if (response?.data?.items) {
						set({ savedCalculations: response.data.items });
					}
				} catch (error) {
					console.error('Error loading saved calculations:', error);
				} finally {
					set({ isLoading: false });
				}
			},

			getCalculationById: (id) => {
				return get().savedCalculations.find((calc) => calc.id === id) || null;
			},

			deleteCalculation: async (id) => {
				try {
					const { wealthCalculationService } = await import('../services/wealthCalculationService');
					await wealthCalculationService.deleteCalculation(id);
					set((state) => ({
						savedCalculations: state.savedCalculations.filter((calc) => calc.id !== id),
					}));
				} catch (error) {
					console.error('Error deleting calculation:', error);
					throw error;
				}
			},

			archiveCalculation: async (id) => {
				try {
					const { wealthCalculationService } = await import('../services/wealthCalculationService');
					await wealthCalculationService.updateCalculation(id, { status: 'archived' });
					set((state) => ({
						savedCalculations: state.savedCalculations.map((calc) =>
							calc.id === id ? { ...calc, status: 'archived' as const } : calc
						),
					}));
				} catch (error) {
					console.error('Error archiving calculation:', error);
					throw error;
				}
			},

			unarchiveCalculation: async (id) => {
				try {
					const { wealthCalculationService } = await import('../services/wealthCalculationService');
					await wealthCalculationService.updateCalculation(id, { status: 'active' });
					set((state) => ({
						savedCalculations: state.savedCalculations.map((calc) =>
							calc.id === id ? { ...calc, status: 'active' as const } : calc
						),
					}));
				} catch (error) {
					console.error('Error unarchiving calculation:', error);
					throw error;
				}
			},
		}),
		{
			name: 'wealth-calculation-storage',
			partialize: (state) => ({
				// Only persist certain parts of state
				savedCalculations: state.savedCalculations,
				nisaabData: state.nisaabData,
			}),
		}
	)
);
