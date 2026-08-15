/**
 * id_cards.ts — API module for ID card requests.
 */
import { request, unwrap } from './utils';
import type { ApiResponse, PaginatedResponse } from './utils';
import type { IdCard, CreateIdCardPayload, UpdateIdCardStatusPayload } from '../../types/id_card';

export const getIdCardRequests = async (page = 1, limit = 50): Promise<PaginatedResponse<IdCard>> => {
    return request<PaginatedResponse<IdCard>>({
        url:    '/id-cards',
        method: 'GET',
        params: { page, limit },
    });
};

export const getIdCardById = async (id: string): Promise<IdCard> => {
    const res = await request<ApiResponse<IdCard>>({
        url:    `/id-cards/${id}`,
        method: 'GET',
    });
    return unwrap(res);
};

export const createIdCardRequest = async (data: CreateIdCardPayload): Promise<IdCard> => {
    const res = await request<ApiResponse<IdCard>>({
        url:    '/id-cards',
        method: 'POST',
        data,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
    });
    return unwrap(res);
};

export const updateIdCardStatus = async (
    id: string,
    data: UpdateIdCardStatusPayload
): Promise<IdCard> => {
    const res = await request<ApiResponse<IdCard>>({
        url:    `/id-cards/${id}/status`,
        method: 'PATCH',
        data,
    });
    return unwrap(res);
};
