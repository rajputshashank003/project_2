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
    passportPhotoBase64: string;
    paymentScreenshotBase64: string;
}

export interface UpdateIdCardStatusPayload {
    status: IdCardStatus;
    rejectionReason?: string;
}
