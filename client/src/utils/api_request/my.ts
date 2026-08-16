/**
 * my.ts — API functions for the authenticated user's own records (profile page).
 */
import { request } from "./utils";
import type { PaginatedResponse } from "./utils";
import type { Donation } from "../../types/donation";
import type { IdCard } from "../../types/id_card";

/**
 * GET /api/v1/my/donations
 * Returns the current authenticated user's donations (all statuses), paginated.
 */
export const getMyDonations = async (
    page = 1,
    limit = 20,
): Promise<PaginatedResponse<Donation>> => {
    return request<PaginatedResponse<Donation>>({
        url: "/my/donations",
        method: "GET",
        params: { page, limit },
    });
};

/**
 * GET /api/v1/my/id-cards
 * Returns the current authenticated user's ID card requests (all statuses), paginated.
 */
export const getMyIdCards = async (
    page = 1,
    limit = 20,
): Promise<PaginatedResponse<IdCard>> => {
    return request<PaginatedResponse<IdCard>>({
        url: "/my/id-cards",
        method: "GET",
        params: { page, limit },
    });
};
