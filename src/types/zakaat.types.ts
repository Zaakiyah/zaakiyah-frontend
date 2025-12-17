export enum ApplicationType {
	INDIVIDUAL = 'individual',
	ORGANIZATION = 'organization',
}

export enum ApplicationStatus {
	DRAFT = 'draft',
	SUBMITTED = 'submitted',
	UNDER_REVIEW = 'under_review',
	APPROVED = 'approved',
	REJECTED = 'rejected',
	DISBURSED = 'disbursed',
	COMPLETED = 'completed',
	WITHDRAWN = 'withdrawn',
}

export enum VettingStage {
	ELIGIBILITY = 'eligibility',
	VERIFICATION = 'verification',
	APPROVAL = 'approval',
	DISBURSEMENT = 'disbursement',
}

export enum CollateralType {
	CAR = 'car',
	MACHINE = 'machine',
	PROPERTY = 'property',
	GOLD = 'gold',
	OTHER = 'other',
}

export interface PersonalInfo {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	dateOfBirth?: string;
	gender?: string;
	address?: string;
}

export interface OrganizationInfo {
	organizationName: string;
	registrationNumber: string;
	organizationType: string;
	address: string;
	email: string;
	phoneNumber: string;
}

export interface FinancialInfo {
	businessRevenue?: number;
	netProfit?: number;
	additionalInfo?: Record<string, any>;
}

export interface IntendedUse {
	category: string;
	subcategory?: string;
	description: string;
	supportingDocuments?: string[];
}

export interface BankDetails {
	bankName: string;
	accountNumber: string;
	accountName: string;
}

export interface ZakaatApplication {
	id: string;
	userId: string;
	applicationType: ApplicationType;
	status: ApplicationStatus;
	vettingStage: VettingStage;
	requestedAmount?: number;
	personalInfo?: PersonalInfo | OrganizationInfo;
	idVerificationStatus?: 'pending' | 'verified' | 'rejected';
	idDocumentUrl?: string;
	selfieUrl?: string;
	idCountry?: string;
	idRegion?: string;
	idType?: string;
	financialInfo?: FinancialInfo;
	intendedUse?: IntendedUse;
	bankName?: string;
	accountNumber?: string;
	accountName?: string;
	supportingDocuments?: string[];
	campaignImageUrl?: string;
	campaignFliers?: string[];
	approvedAmount?: number;
	disbursedAmount?: number;
	disbursementReference?: string;
	submittedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface EligibilityCheckRequest {
	requestedAmount: number;
}

export interface EligibilityCheckResponse {
	eligible: boolean;
	message?: string;
	maxEligibleAmount?: number;
}

export interface CreateZakaatApplicationRequest {
	applicationType: ApplicationType;
	requestedAmount?: number;
	personalInfo?: PersonalInfo;
	organizationInfo?: OrganizationInfo;
	financialInfo?: FinancialInfo;
	intendedUse?: IntendedUse;
	bankDetails?: BankDetails;
	supportingDocuments?: string[];
	campaignImageUrl?: string;
	campaignFliers?: string[];
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
