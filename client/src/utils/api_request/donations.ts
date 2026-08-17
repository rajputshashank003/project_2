/**
 * donations.ts — API module for donation requests.
 */
import { request, unwrap } from "./utils";
import type { ApiResponse, PaginatedResponse } from "./utils";
import type {
    Donation,
    CreateDonationPayload,
    UpdateDonationStatusPayload,
} from "../../types/donation";

export interface DonationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalCollected: number;
}

export const getDonations = async (
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string,
): Promise<PaginatedResponse<Donation, DonationStats>> => {
    return request<PaginatedResponse<Donation, DonationStats>>({
        url: "/donations",
        method: "GET",
        params: {
            page,
            limit,
            status: status && status !== "all" ? status : undefined,
            search: search?.trim() || undefined,
            start_date: startDate?.trim() || undefined,
            end_date: endDate?.trim() || undefined,
        },
    });
};

export const getDonationById = async (id: string): Promise<Donation> => {
    const res = await request<ApiResponse<Donation>>({
        url: `/donations/${id}`,
        method: "GET",
    });
    return unwrap(res);
};

export const createDonation = async (
    data: CreateDonationPayload | FormData,
): Promise<Donation> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        body.append("donorName", data.donorName);
        body.append("phone", data.phone);
        body.append("email", data.email);
        body.append("amount", String(data.amount));
        body.append("paymentProof", data.paymentProof);
        if (data.utrNumber) body.append("utrNumber", data.utrNumber);
    }
    const res = await request<ApiResponse<Donation>>({
        url: "/donations",
        method: "POST",
        data: body,
        headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return unwrap(res);
};

export const updateDonationStatus = async (
    id: string,
    data: UpdateDonationStatusPayload,
): Promise<Donation> => {
    const res = await request<ApiResponse<Donation>>({
        url: `/donations/${id}/status`,
        method: "PATCH",
        data,
    });
    return unwrap(res);
};
