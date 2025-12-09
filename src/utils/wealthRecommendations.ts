/**
 * Smart Recommendations Utilities
 * Provides intelligent recommendations for Nisaab selection, notifications, etc.
 */

import type {
	Asset,
	Liability,
	NisaabBase,
	NisaabData,
	NotificationFrequency,
	NisaabRecommendation,
	NotificationRecommendation,
} from '../types/wealth.types';
import { calculateNetWorth } from './wealthCalculation';

// ============================================================================
// NISAAB RECOMMENDATIONS
// ============================================================================

/**
 * Recommend Nisaab base based on user's wealth
 */
export function recommendNisaabBase(
	assets: Asset[],
	liabilities: Liability[],
	nisaabData: NisaabData
): NisaabRecommendation {
	const netWorth = calculateNetWorth(assets, liabilities);
	const goldThreshold = nisaabData.goldNisaabValue;
	const silverThreshold = nisaabData.silverNisaabValue;

	const meetsGold = netWorth >= goldThreshold;
	const meetsSilver = netWorth >= silverThreshold;

	// Recommendation logic based on wealth level
	let recommended: NisaabBase;
	let reason: string;

	if (meetsGold) {
		// If meets Gold, recommend Gold (standard)
		recommended = 'gold';
		reason = 'Your wealth exceeds the Gold Nisaab threshold. Gold is the recommended standard used by most contemporary scholars.';
	} else if (meetsSilver && !meetsGold) {
		// If meets Silver but not Gold, recommend Silver with explanation
		recommended = 'silver';
		reason =
			'Your wealth exceeds the Silver Nisaab threshold but is below Gold Nisaab. You may choose Silver Nisaab, which is based on the original Prophetic standard mentioned in authentic hadith.';
	} else {
		// Below both - still recommend Gold but note they don't meet threshold
		recommended = 'gold';
		reason =
			'Gold is the recommended standard. Note: Your wealth is currently below both Gold and Silver Nisaab thresholds, so Zakaat is not due at this time.';
	}

	return {
		recommended,
		reason,
		goldStatus: meetsGold ? 'meets' : 'below',
		silverStatus: meetsSilver ? 'meets' : 'below',
	};
}

// ============================================================================
// NOTIFICATION RECOMMENDATIONS
// ============================================================================

/**
 * Recommend notification frequency based on user patterns
 * For now, uses default recommendation - will be enhanced with user history in Phase 6
 */
export function recommendNotificationFrequency(
	netWorth: number,
	nisaabThreshold: number,
	hasPreviousCalculations: boolean = false
): NotificationRecommendation {
	// Default recommendation: Annually (most common for Zakaat)
	let recommendedFrequency: NotificationFrequency = 'annually';
	let reason = 'Annual recalculation is recommended for Zakaat purposes, as wealth and Nisaab values change over time.';

	// If user has multiple calculations, they might prefer more frequent updates
	if (hasPreviousCalculations) {
		// Could be customized based on user behavior in future
	}

	// If wealth is close to threshold, recommend quarterly checks
	const thresholdPercentage = (netWorth / nisaabThreshold) * 100;
	if (thresholdPercentage >= 80 && thresholdPercentage < 100) {
		recommendedFrequency = 'quarterly';
		reason =
			'Your wealth is close to the Nisaab threshold. Quarterly checks will help you stay aware of when Zakaat becomes due.';
	}

	// If wealth significantly exceeds threshold, annual is fine
	if (thresholdPercentage >= 150) {
		recommendedFrequency = 'annually';
		reason =
			'Your wealth significantly exceeds the Nisaab threshold. Annual recalculation is sufficient for Zakaat purposes.';
	}

	return {
		recommendedFrequency,
		reason,
	};
}

/**
 * Recommend if user should recalculate
 * Based on time since last calculation and market changes
 */
export function shouldRecalculate(lastCalculationDate: Date | null, _nisaabData: NisaabData): {
	should: boolean;
	reason: string;
} {
	if (!lastCalculationDate) {
		return {
			should: true,
			reason: 'You haven\'t calculated your Zakaat yet this year.',
		};
	}

	const now = new Date();
	const daysSinceLastCalc = Math.floor((now.getTime() - lastCalculationDate.getTime()) / (1000 * 60 * 60 * 24));

	if (daysSinceLastCalc > 365) {
		return {
			should: true,
			reason: 'It has been more than a year since your last calculation. Nisaab values and your wealth may have changed significantly.',
		};
	}

	if (daysSinceLastCalc > 90) {
		return {
			should: true,
			reason: 'It has been more than 3 months since your last calculation. Consider recalculating to ensure accuracy.',
		};
	}

	return {
		should: false,
		reason: 'Your calculation is recent and up to date.',
	};
}

// ============================================================================
// GENERAL RECOMMENDATIONS
// ============================================================================

/**
 * Get helpful suggestions for improving calculation accuracy
 */
export function getCalculationSuggestions(assets: Asset[], liabilities: Liability[]): string[] {
	const suggestions: string[] = [];

	// Check for missing common asset types
	const assetTypes = assets.map((a) => a.type);
	if (!assetTypes.includes('cash')) {
		suggestions.push('Make sure to include all cash holdings (physical cash, money at home, etc.)');
	}
	if (!assetTypes.includes('bank')) {
		suggestions.push('Remember to include all bank account balances (savings, checking, etc.)');
	}

	// Check if liabilities seem incomplete
	if (liabilities.length === 0) {
		suggestions.push('Don\'t forget to include any outstanding debts, loans, or bills you need to pay.');
	}

	// Check for unusual patterns
	const totalAssets = assets.reduce((sum, a) => sum + (a.convertedAmount || a.amount), 0);
	const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.convertedAmount || l.amount), 0);

	if (totalLiabilities > totalAssets * 0.8) {
		suggestions.push(
			'Your liabilities are very high relative to your assets. Make sure all figures are accurate.'
		);
	}

	return suggestions;
}

