import type { UserDesignation } from './user';

export type IdCardStatus = 'pending' | 'approved' | 'rejected';

export interface IdCard {
    id: string;
    userId: string;
    userName: string;
    phone: string;
    email: string;
    address: string;
    designation: UserDesignation;
    passportPhotoUrl: string;
    paymentScreenshotUrl: string;
    uniqueCardNumber: string;
    status: IdCardStatus;
    rejectionReason?: string;
    validityYears?: number;
    issueDate?: string;
    expiryDate?: string;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

export interface CreateIdCardPayload {
    userName: string;
    phone: string;
    email: string;
    address: string;
    designation: UserDesignation;
    passportPhoto: File;
    paymentProof: File;
}

export interface UpdateIdCardStatusPayload {
    status: IdCardStatus;
    rejectionReason?: string;
    validityYears?: number;
}
