/**
 * Wealth Calculation Validation Utilities
 * Provides validation functions for assets, liabilities, and calculations
 */

import type { Asset, Liability, ValidationMessage, ValidationResult } from '../types/wealth.types';

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

const UNUSUAL_VALUES = {
	goldWeightMax: 10000, // grams (10kg) - warn if above
	silverWeightMax: 100000, // grams (100kg) - warn if above
	assetValueMax: 1000000000, // $1 billion - warn if above
	marketPriceDifferencePercent: 20, // Warn if price differs by >20% from market
};

// ============================================================================
// ASSET VALIDATION
// ============================================================================

/**
 * Validate an asset
 */
export function validateAsset(asset: Asset): ValidationMessage[] {
	const messages: ValidationMessage[] = [];

	// Blocking validations
	if (asset.amount < 0) {
		messages.push({
			level: 'error',
			message: 'Asset amount cannot be negative',
			field: 'amount',
			action: 'Please enter a positive value',
		});
	}

	if (!asset.amount || asset.amount === 0) {
		messages.push({
			level: 'error',
			message: 'Asset amount is required',
			field: 'amount',
			action: 'Please enter an amount',
		});
	}

	// Gold/Silver specific validations
	if (asset.type === 'gold' || asset.type === 'silver') {
		const goldSilverAsset = asset as any;
		const maxWeight = asset.type === 'gold' ? UNUSUAL_VALUES.goldWeightMax : UNUSUAL_VALUES.silverWeightMax;

		if (!goldSilverAsset.weight || goldSilverAsset.weight <= 0) {
			messages.push({
				level: 'error',
				message: `${asset.type === 'gold' ? 'Gold' : 'Silver'} weight is required`,
				field: 'weight',
				action: 'Please enter the weight in grams',
			});
		}

		if (goldSilverAsset.weight > maxWeight) {
			messages.push({
				level: 'warning',
				message: `This weight seems very large (${goldSilverAsset.weight.toFixed(0)}g). Please verify it's correct.`,
				field: 'weight',
				action: 'Double-check your weight input',
			});
		}

		if (!goldSilverAsset.pricePerGram || goldSilverAsset.pricePerGram <= 0) {
			messages.push({
				level: 'error',
				message: `Price per gram is required`,
				field: 'pricePerGram',
				action: 'Please enter the price per gram or use current market price',
			});
		}
	}

	// Livestock specific validations
	if (asset.type === 'livestock') {
		const livestockAsset = asset as any;
		if (!livestockAsset.count || livestockAsset.count <= 0) {
			messages.push({
				level: 'error',
				message: 'Livestock count is required',
				field: 'count',
				action: 'Please enter the number of livestock',
			});
		}
	}

	// Custom asset validations
	if (asset.type === 'custom') {
		const customAsset = asset as any;
		if (!customAsset.title || customAsset.title.trim() === '') {
			messages.push({
				level: 'error',
				message: 'Asset title is required',
				field: 'title',
				action: 'Please enter a name for this asset',
			});
		}
	}

	// Warning validations (unusual values)
	if (asset.amount > UNUSUAL_VALUES.assetValueMax) {
		messages.push({
			level: 'warning',
			message: 'This value seems unusually large. Please verify it\'s correct.',
			field: 'amount',
			action: 'Double-check your amount',
		});
	}

	return messages;
}

/**
 * Validate gold/silver price against market price
 */
export function validateGoldSilverPrice(
	pricePerGram: number,
	marketPricePerGram: number
): ValidationMessage | null {
	if (!marketPricePerGram || pricePerGram === 0) return null;

	const difference = Math.abs(pricePerGram - marketPricePerGram);
	const percentageDiff = (difference / marketPricePerGram) * 100;

	if (percentageDiff > UNUSUAL_VALUES.marketPriceDifferencePercent) {
		return {
			level: 'warning',
			message: `This price is ${percentageDiff.toFixed(1)}% different from current market price (${marketPricePerGram.toLocaleString()}/g). Please verify.`,
			field: 'pricePerGram',
			action: 'Consider using the current market price',
		};
	}

	return null;
}

// ============================================================================
// LIABILITY VALIDATION
// ============================================================================

/**
 * Validate a liability
 */
export function validateLiability(liability: Liability): ValidationMessage[] {
	const messages: ValidationMessage[] = [];

	// Blocking validations
	if (liability.amount < 0) {
		messages.push({
			level: 'error',
			message: 'Liability amount cannot be negative',
			field: 'amount',
			action: 'Please enter a positive value',
		});
	}

	if (!liability.amount || liability.amount === 0) {
		messages.push({
			level: 'error',
			message: 'Liability amount is required',
			field: 'amount',
			action: 'Please enter an amount',
		});
	}

	// Custom liability validations
	if (liability.type === 'custom') {
		const customLiability = liability as any;
		if (!customLiability.title || customLiability.title.trim() === '') {
			messages.push({
				level: 'error',
				message: 'Liability title is required',
				field: 'title',
				action: 'Please enter a name for this liability',
			});
		}
	}

	// Warning validations
	if (liability.amount > UNUSUAL_VALUES.assetValueMax) {
		messages.push({
			level: 'warning',
			message: 'This value seems unusually large. Please verify it\'s correct.',
			field: 'amount',
			action: 'Double-check your amount',
		});
	}

	return messages;
}

// ============================================================================
// CALCULATION VALIDATION
// ============================================================================

/**
 * Validate calculation form state
 */
export function validateCalculationForm(assets: Asset[], liabilities: Liability[]): ValidationResult {
	const errors: ValidationMessage[] = [];
	const warnings: ValidationMessage[] = [];
	const suggestions: ValidationMessage[] = [];

	// Validate assets
	assets.forEach((asset) => {
		const assetMessages = validateAsset(asset);
		assetMessages.forEach((msg) => {
			if (msg.level === 'error') errors.push(msg);
			else if (msg.level === 'warning') warnings.push(msg);
			else suggestions.push(msg);
		});
	});

	// Validate liabilities
	liabilities.forEach((liability) => {
		const liabilityMessages = validateLiability(liability);
		liabilityMessages.forEach((msg) => {
			if (msg.level === 'error') errors.push(msg);
			else if (msg.level === 'warning') warnings.push(msg);
			else suggestions.push(msg);
		});
	});

	// Form-level validations
	if (assets.length === 0) {
		errors.push({
			level: 'error',
			message: 'At least one asset is required',
			field: 'assets',
			action: 'Please add at least one asset',
		});
	}

	// Suggestions
	if (assets.length === 1 && assets[0].amount < 100) {
		suggestions.push({
			level: 'suggestion',
			message: 'Make sure you\'ve included all your zakaatable assets (cash, bank savings, gold, silver, etc.)',
			field: 'assets',
		});
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		suggestions,
	};
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

/**
 * Validate and parse currency input
 */
export function validateCurrencyInput(value: string): { valid: boolean; error?: string; parsed?: number } {
	if (!value || value.trim() === '') {
		return { valid: false, error: 'Amount is required' };
	}

	const parsed = parseFloat(value);
	if (isNaN(parsed)) {
		return { valid: false, error: 'Invalid number format' };
	}

	if (parsed < 0) {
		return { valid: false, error: 'Amount cannot be negative' };
	}

	// Limit to reasonable precision
	if (parsed > 0 && parsed < 0.01) {
		return { valid: false, error: 'Amount must be at least 0.01' };
	}

	return { valid: true, parsed };
}

/**
 * Format number for currency input (limit decimals)
 */
export function formatCurrencyInput(value: number | string): string {
	if (typeof value === 'string') {
		return value;
	}
	// Limit to 2 decimal places for currency
	return value.toFixed(2);
}

