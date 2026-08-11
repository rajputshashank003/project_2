export type DonationStatus = 'pending' | 'approved' | 'rejected';

export interface Donation {
    id: string;
    donorName: string;
    phone: string;
    email: string;
    amount: number;
    paymentScreenshotUrl: string;
    utrNumber?: string;
    status: DonationStatus;
    rejectionReason?: string;
    certificateUrl?: string;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

export interface CreateDonationPayload {
    donorName: string;
    phone: string;
    email: string;
    amount: number;
    paymentScreenshotBase64: string;
    utrNumber?: string;
}

export interface UpdateDonationStatusPayload {
    status: DonationStatus;
    rejectionReason?: string;
}
