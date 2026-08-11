/**
 * donations.ts — API module for donation requests.
 * Uses mock data when no backend is available (VITE_API_BASE_URL not set).
 */
import { request } from './utils';
import { mock_donations } from '../../mock/donations';
import type { Donation, CreateDonationPayload, UpdateDonationStatusPayload } from '../../types/donation';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

let _mock_store: Donation[] = [...mock_donations];

export const getDonations = async (): Promise<Donation[]> => {
    if (USE_MOCK) {
        return Promise.resolve([..._mock_store]);
    }
    return request<Donation[]>({ url: '/donations', method: 'GET' });
};

export const getDonationById = async (id: string): Promise<Donation> => {
    if (USE_MOCK) {
        const found = _mock_store.find((d) => d.id === id);
        if (!found) return Promise.reject(new Error('Donation not found'));
        return Promise.resolve(found);
    }
    return request<Donation>({ url: `/donations/${id}`, method: 'GET' });
};

export const createDonation = async (data: CreateDonationPayload): Promise<Donation> => {
    if (USE_MOCK) {
        const donation: Donation = {
            id:                   `DON-${Date.now()}`,
            donorName:            data.donorName,
            phone:                data.phone,
            email:                data.email,
            amount:               data.amount,
            paymentScreenshotUrl: data.paymentScreenshotBase64,
            utrNumber:            data.utrNumber,
            status:               'pending',
            requestedAt:          new Date().toISOString(),
        };
        _mock_store = [donation, ..._mock_store];
        return Promise.resolve(donation);
    }
    return request<Donation>({ url: '/donations', method: 'POST', data });
};

export const updateDonationStatus = async (
    id: string,
    data: UpdateDonationStatusPayload
): Promise<Donation> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((d) =>
            d.id === id
                ? {
                      ...d,
                      status:          data.status,
                      rejectionReason: data.rejectionReason,
                      reviewedAt:      new Date().toISOString(),
                      reviewedBy:      'admin',
                  }
                : d
        );
        const updated = _mock_store.find((d) => d.id === id)!;
        return Promise.resolve(updated);
    }
    return request<Donation>({ url: `/donations/${id}/status`, method: 'PATCH', data });
};
