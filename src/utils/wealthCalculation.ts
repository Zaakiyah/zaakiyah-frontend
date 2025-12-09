/**
 * Wealth Calculation Utilities
 * Core calculation logic for Zakaat calculation
 */

import type { Asset, Liability, NisaabBase, NisaabData, CalculationResult } from '../types/wealth.types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const ZAKAT_RATE = 2.5; // 2.5%

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate total assets value
 * Always uses convertedAmount when available (even if 0), otherwise uses amount
 */
export function calculateTotalAssets(assets: Asset[]): number {
	return assets.reduce((total, asset) => {
		// For gold/silver, calculate from weight × price first
		if (asset.type === 'gold' || asset.type === 'silver') {
			const goldSilverAsset = asset as any;
			if (goldSilverAsset.weight && goldSilverAsset.pricePerGram) {
				const calculatedValue = goldSilverAsset.weight * goldSilverAsset.pricePerGram;
				// Use convertedAmount if available, otherwise use calculated value
				return total + (asset.convertedAmount !== undefined && asset.convertedAmount !== null 
					? asset.convertedAmount 
					: calculatedValue);
			}
		}
		
		// For all other assets, use convertedAmount if available, otherwise use amount
		const assetValue = asset.convertedAmount !== undefined && asset.convertedAmount !== null
			? asset.convertedAmount
			: asset.amount;
		
		return total + assetValue;
	}, 0);
}

/**
 * Calculate total liabilities value
 * Always uses convertedAmount when available (even if 0), otherwise uses amount
 */
export function calculateTotalLiabilities(liabilities: Liability[]): number {
	return liabilities.reduce((total, liability) => {
		// Use convertedAmount if available (even if 0), otherwise use amount
		const liabilityValue = liability.convertedAmount !== undefined && liability.convertedAmount !== null
			? liability.convertedAmount
			: liability.amount;
		return total + liabilityValue;
	}, 0);
}

/**
 * Calculate net worth (assets - liabilities)
 */
export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): number {
	const totalAssets = calculateTotalAssets(assets);
	const totalLiabilities = calculateTotalLiabilities(liabilities);
	return totalAssets - totalLiabilities;
}

/**
 * Get Nisaab threshold based on selected base
 */
export function getNisaabThreshold(nisaabBase: NisaabBase, nisaabData: NisaabData): number {
	return nisaabBase === 'gold' ? nisaabData.goldNisaabValue : nisaabData.silverNisaabValue;
}

/**
 * Check if wealth meets Nisaab threshold
 */
export function meetsNisaab(netWorth: number, nisaabBase: NisaabBase, nisaabData: NisaabData): boolean {
	const threshold = getNisaabThreshold(nisaabBase, nisaabData);
	return netWorth >= threshold;
}

/**
 * Calculate Zakaat amount (2.5% of net worth)
 * Returns null if doesn't meet Nisaab
 */
export function calculateZakat(
	netWorth: number,
	nisaabBase: NisaabBase,
	nisaabData: NisaabData
): number | null {
	if (!meetsNisaab(netWorth, nisaabBase, nisaabData)) {
		return null;
	}

	const zakatAmount = (netWorth * ZAKAT_RATE) / 100;
	return Math.round(zakatAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Perform complete calculation
 */
export function performCalculation(
	assets: Asset[],
	liabilities: Liability[],
	nisaabBase: NisaabBase,
	nisaabData: NisaabData
): CalculationResult {
	const totalAssets = calculateTotalAssets(assets);
	const totalLiabilities = calculateTotalLiabilities(liabilities);
	const netWorth = calculateNetWorth(assets, liabilities);
	const nisaabThreshold = getNisaabThreshold(nisaabBase, nisaabData);
	const meetsNisaabThreshold = meetsNisaab(netWorth, nisaabBase, nisaabData);
	const zakatDue = calculateZakat(netWorth, nisaabBase, nisaabData);

	return {
		totalAssets,
		totalLiabilities,
		netWorth,
		meetsNisaab: meetsNisaabThreshold,
		nisaabBase,
		nisaabThreshold,
		zakatDue,
		zakatRate: ZAKAT_RATE,
	};
}

// ============================================================================
// CURRENCY CONVERSION HELPERS
// ============================================================================

/**
 * Convert amount from one currency to another
 * This is a placeholder - will be replaced with real currency service in Phase 6
 */
export function convertCurrency(
	amount: number,
	fromCurrency: string,
	toCurrency: string,
	exchangeRate: number
): number {
	if (fromCurrency === toCurrency) return amount;
	return amount * exchangeRate;
}

/**
 * Calculate percentage of threshold
 */
export function getThresholdPercentage(netWorth: number, threshold: number): number {
	if (threshold === 0) return 0;
	return Math.min((netWorth / threshold) * 100, 100);
}

