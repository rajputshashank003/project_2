/**
 * users.ts — API module for user management.
 */
import { request, unwrap } from "./utils";
import type { ApiResponse, PaginatedResponse } from "./utils";
import type { User, UserDesignation } from "../../types/user";

export const getUsers = async (
    page = 1,
    limit = 20,
    bloodGroup?: string,
    search?: string,
): Promise<PaginatedResponse<User>> => {
    return request<PaginatedResponse<User>>({
        url: "/users",
        method: "GET",
        params: {
            page,
            limit,
            blood_group: bloodGroup || undefined,
            search: search?.trim() || undefined,
        },
    });
};

export const updateUser = async (
    id: string,
    data: {
        name?: string;
        email?: string;
        designation?: UserDesignation;
        bloodGroup?: string;
    },
): Promise<User> => {
    const res = await request<ApiResponse<User>>({
        url: `/users/${id}`,
        method: "PATCH",
        data,
    });
    return unwrap(res);
};

export const updateUserDesignation = async (
    id: string,
    designation: UserDesignation,
): Promise<User> => {
    return updateUser(id, { designation });
};

export const promoteUser = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/users/${id}/promote`, method: "PATCH" });
};

export const demoteUser = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/users/${id}/demote`, method: "PATCH" });
};
