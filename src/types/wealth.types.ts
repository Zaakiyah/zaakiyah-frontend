/**
 * Wealth Calculation Types
 * Type definitions for the wealth calculation feature
 */

// ============================================================================
// NISAAB TYPES
// ============================================================================

export type NisaabBase = 'gold' | 'silver';

export interface NisaabData {
	goldNisaabValue: number;
	silverNisaabValue: number;
	goldPricePerGram: number;
	silverPricePerGram: number;
	currency: string;
	date: string;
}

// ============================================================================
// ASSET TYPES
// ============================================================================

export type AssetType =
	| 'cash'
	| 'bank'
	| 'stocks'
	| 'business'
	| 'gold'
	| 'silver'
	| 'livestock'
	| 'farmProduce'
	| 'custom';

export interface BaseAsset {
	id: string;
	type: AssetType;
	amount: number; // Amount in user's preferred currency
	currency?: string; // Original currency if different
	convertedAmount?: number; // Converted to preferred currency
}

export interface CashAsset extends BaseAsset {
	type: 'cash';
}

export interface BankAsset extends BaseAsset {
	type: 'bank';
}

export interface StocksAsset extends BaseAsset {
	type: 'stocks';
}

export interface BusinessAsset extends BaseAsset {
	type: 'business';
}

export interface GoldAsset extends BaseAsset {
	type: 'gold';
	weight: number; // Weight in grams
	pricePerGram: number; // Price per gram
	useMarketPrice?: boolean; // Whether to use current market price
}

export interface SilverAsset extends BaseAsset {
	type: 'silver';
	weight: number; // Weight in grams
	pricePerGram: number; // Price per gram
	useMarketPrice?: boolean; // Whether to use current market price
}

export interface LivestockAsset extends BaseAsset {
	type: 'livestock';
	livestockType: string; // e.g., 'cattle', 'sheep', 'goats'
	count: number;
	valuePerUnit: number;
}

export interface FarmProduceAsset extends BaseAsset {
	type: 'farmProduce';
}

export interface CustomAsset extends BaseAsset {
	type: 'custom';
	title: string;
	category?: string;
	description?: string;
}

export type Asset =
	| CashAsset
	| BankAsset
	| StocksAsset
	| BusinessAsset
	| GoldAsset
	| SilverAsset
	| LivestockAsset
	| FarmProduceAsset
	| CustomAsset;

// ============================================================================
// LIABILITY TYPES
// ============================================================================

export type LiabilityType = 'loan' | 'creditCard' | 'bills' | 'rent' | 'other' | 'custom';

export interface BaseLiability {
	id: string;
	type: LiabilityType;
	amount: number; // Amount in user's preferred currency
	currency?: string; // Original currency if different
	convertedAmount?: number; // Converted to preferred currency
}

export interface LoanLiability extends BaseLiability {
	type: 'loan';
}

export interface CreditCardLiability extends BaseLiability {
	type: 'creditCard';
}

export interface BillsLiability extends BaseLiability {
	type: 'bills';
}

export interface RentLiability extends BaseLiability {
	type: 'rent';
}

export interface OtherLiability extends BaseLiability {
	type: 'other';
}

export interface CustomLiability extends BaseLiability {
	type: 'custom';
	title: string;
	description?: string;
}

export type Liability =
	| LoanLiability
	| CreditCardLiability
	| BillsLiability
	| RentLiability
	| OtherLiability
	| CustomLiability;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export type ValidationLevel = 'error' | 'warning' | 'suggestion';

export interface ValidationMessage {
	level: ValidationLevel;
	message: string;
	field?: string;
	action?: string; // Suggested action or correction
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationMessage[];
	warnings: ValidationMessage[];
	suggestions: ValidationMessage[];
}

// ============================================================================
// CALCULATION TYPES
// ============================================================================

export type CalculationStatus = 'draft' | 'active' | 'archived' | 'completed';

export interface CalculationTotals {
	totalAssets: number;
	totalLiabilities: number;
	netWorth: number;
}

export interface CalculationResult extends CalculationTotals {
	meetsNisaab: boolean;
	nisaabBase: NisaabBase;
	nisaabThreshold: number;
	zakatDue: number | null; // null if doesn't meet nisaab
	zakatRate: number; // Always 2.5%
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export type NotificationFrequency = 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'custom';

export interface NotificationPreferences {
	enabled: boolean;
	frequency: NotificationFrequency | null;
	customIntervalMonths?: number; // If frequency is 'custom'
	notifyRecalculate: boolean;
	notifyZakatDue: boolean;
	notifyNisaabChange: boolean;
	notifySummary: boolean;
	nextNotificationDate?: string;
	// Channel preferences (optional, uses user defaults if not provided)
	email?: boolean;
	inApp?: boolean;
	push?: boolean;
}

// ============================================================================
// WEALTH CALCULATION
// ============================================================================

export interface WealthCalculation {
	id: string;
	userId?: string;
	name?: string; // Optional name/label for the calculation

	// Assets and Liabilities (JSON from backend)
	assets: Asset[] | any;
	liabilities: Liability[] | any;

	// Calculation Results (flat structure from backend)
	totalAssets: number;
	totalLiabilities: number;
	netWorth: number;
	meetsNisaab: boolean;
	nisaabBase: NisaabBase;
	nisaabThreshold: number;
	zakatDue?: number | null;
	zakatRate: number;
	goldNisaabValue: number;
	silverNisaabValue: number;

	// Nisaab data used for calculation (JSON from backend)
	nisaabDataUsed: NisaabData | any;

	// Currency
	currency: string;

	// Status
	status: CalculationStatus;

	// Notification Preferences (flat structure from backend)
	notificationEnabled?: boolean;
	notificationFrequency?: NotificationFrequency | null;
	customIntervalMonths?: number;
	notifyRecalculate?: boolean;
	notifyZakatDue?: boolean;
	notifyNisaabChange?: boolean;
	notifySummary?: boolean;
	nextNotificationDate?: string | Date;

	// Metadata
	calculationDate: string | Date;
	createdAt: string | Date;
	updatedAt: string | Date;
	archivedAt?: string | Date;
}

// ============================================================================
// WIZARD STATE TYPES
// ============================================================================

export type WizardStep = 'welcome' | 'assets' | 'liabilities' | 'nisaab' | 'results' | 'save';

export interface WizardState {
	currentStep: WizardStep;
	steps: WizardStep[];
	canGoNext: boolean;
	canGoBack: boolean;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
	message: string;
	statusCode: number;
	data: T;
}

export interface PaginationMetadata {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
}

export interface PaginatedCalculations {
	items: WealthCalculation[];
	pagination: PaginationMetadata;
}

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface CalculationFormState {
	assets: Asset[];
	liabilities: Liability[];
	nisaabBase: NisaabBase | null;
	selectedNisaabData: NisaabData | null;
	saveCalculation: boolean;
	calculationName?: string;
	notificationPreferences?: NotificationPreferences;
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface NisaabRecommendation {
	recommended: NisaabBase;
	reason: string;
	goldStatus: 'meets' | 'below';
	silverStatus: 'meets' | 'below';
}

export interface NotificationRecommendation {
	recommendedFrequency: NotificationFrequency;
	recommendedIntervalMonths?: number;
	reason: string;
}
