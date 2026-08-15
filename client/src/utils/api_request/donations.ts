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

export const createDonation = async (data: CreateDonationPayload): Promise<Donation> => {
    const res = await request<ApiResponse<Donation>>({
        url:    '/donations',
        method: 'POST',
        data,
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
