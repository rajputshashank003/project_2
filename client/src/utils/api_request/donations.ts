/**
 * donations.ts — API module for donation requests.
 */
import { request, unwrap } from './utils';
import type { ApiResponse, PaginatedResponse } from './utils';
import type { Donation, CreateDonationPayload, UpdateDonationStatusPayload } from '../../types/donation';

export const getDonations = async (page = 1, limit = 50): Promise<PaginatedResponse<Donation>> => {
    return request<PaginatedResponse<Donation>>({
        url:    '/donations',
        method: 'GET',
        params: { page, limit },
    });
};

export const getDonationById = async (id: string): Promise<Donation> => {
    const res = await request<ApiResponse<Donation>>({
        url:    `/donations/${id}`,
        method: 'GET',
    });
    return unwrap(res);
};

export const createDonation = async (data: CreateDonationPayload | FormData): Promise<Donation> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        body.append('donorName', data.donorName);
        body.append('phone', data.phone);
        body.append('email', data.email);
        body.append('amount', String(data.amount));
        body.append('paymentProof', data.paymentProof);
        if (data.utrNumber) body.append('utrNumber', data.utrNumber);
    }
    const res = await request<ApiResponse<Donation>>({
        url:    '/donations',
        method: 'POST',
        data:   body,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
    });
    return unwrap(res);
};

export const updateDonationStatus = async (
    id: string,
    data: UpdateDonationStatusPayload
): Promise<Donation> => {
    const res = await request<ApiResponse<Donation>>({
        url:    `/donations/${id}/status`,
        method: 'PATCH',
        data,
    });
    return unwrap(res);
};
