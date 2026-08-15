/**
 * users.ts — API module for user management.
 */
import { request, unwrap } from './utils';
import type { ApiResponse, PaginatedResponse } from './utils';
import type { User, UserDesignation } from '../../types/user';

export const getUsers = async (page = 1, limit = 100): Promise<PaginatedResponse<User>> => {
    return request<PaginatedResponse<User>>({
        url:    '/users',
        method: 'GET',
        params: { page, limit },
    });
};

export const updateUserDesignation = async (
    id: string,
    designation: UserDesignation
): Promise<User> => {
    const res = await request<ApiResponse<User>>({
        url:    `/users/${id}`,
        method: 'PATCH',
        data:   { designation },
    });
    return unwrap(res);
};

export const promoteUser = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/users/${id}/promote`, method: 'PATCH' });
};

export const demoteUser = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/users/${id}/demote`, method: 'PATCH' });
};
