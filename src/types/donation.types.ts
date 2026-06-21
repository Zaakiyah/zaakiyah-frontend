/**
 * Types for Zakaat Donation Feature
 */

export interface Recipient {
	id: string;
	applicationId: string; // Links to ZakaatApplication
	userId: string;

	// Basic Info (from application personalInfo)
	name: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string | null;
	location: string; // e.g., "Abuja, Nigeria"

	// Application Details
	applicationType: 'individual' | 'organization';
	status: 'approved' | 'ready' | 'disbursed' | 'completed'; // 'ready' means approved and ready to receive
	requestedAmount: number;
	approvedAmount?: number;
	disbursedAmount?: number;
	totalDonations?: number; // Total donations received so far
	shortfall: number; // requestedAmount - (disbursedAmount || 0) - (totalDonations || 0)

	// Profile Information
	whyTheyNeedHelp: string; // From intendedUse.description
	supportingDocuments: Document[];
	campaignImageUrl?: string;
	campaignFliers?: string[];

	// Additional Info (from application)
	category?: string; // From intendedUse.category
	subcategory?: string; // From intendedUse.subcategory
	intendedUse?: string; // From intendedUse.description

	// Application metadata
	submittedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Document {
	id: string;
	name: string; // e.g., "Admission Letter", "Medical Report"
	type: 'pdf' | 'image' | 'other';
	url: string;
	thumbnailUrl?: string;
}

export interface BasketItem {
	recipientId: string;
	recipient: Recipient;
	amount: number; // Allocated amount in Naira
	isManuallyAllocated: boolean;
}

export interface DonationBasket {
	items: BasketItem[];
	totalAmount: number;
	distributionMethod: 'equal' | 'manual' | null;
	supportZaakiyah: boolean;
	zaakiyahAmount: number; // Amount to support Zaakiyah platform
	isAnonymous: boolean;
}

export interface Donation {
	id: string;
	userId: string;

	// Recipients (linked to applications)
	recipients: Array<{
		applicationId: string; // Links to ZakaatApplication
		recipientId: string;
		recipientName: string;
		amount: number;
	}>;

	// Payment
	totalAmount: number;
	zaakiyahAmount: number;
	paymentMethod: 'paystack' | 'wallet';
	paymentReference: string;
	paymentStatus: 'pending' | 'completed' | 'failed';
	paystackReference?: string; // Paystack transaction reference

	// Distribution
	distributionMethod: 'equal' | 'manual';
	isAnonymous: boolean;

	// Metadata
	createdAt: string;
	completedAt?: string;
}

export interface DonationRecipientDetail {
	applicationId: string;
	recipientName: string;
	recipientLocation: string;
	applicationType: 'individual' | 'organization';
	requestedAmount: number;
	approvedAmount?: number;
	disbursedAmount?: number;
	totalDonations: number;
	shortfall: number;
	donationAmount: number; // Amount from this specific donation
	progress: number; // Percentage of requested amount received
	status: string;
	updates?: ApplicationUpdate[]; // Updates from the applicant
}

export interface ApplicationUpdate {
	id: string;
	applicationId: string;
	title: string;
	description: string;
	images?: string[];
	createdAt: string;
	createdBy: string; // userId
}

export interface WatchlistItem {
	id: string;
	recipientId: string;
	recipient: Recipient;
	addedAt: string;
}

export interface PaymentMethod {
	id: string;
	name: string;
	type: 'paystack' | 'wallet';
	icon?: string;
	isAvailable: boolean;
}

export interface DonationSummary {
	totalRecipients: number;
	totalAmount: number;
	zaakiyahAmount: number;
	distributionMethod: 'equal' | 'manual';
	recipientBreakdown: Array<{
		recipientId: string;
		recipientName: string;
		amount: number;
	}>;
}
