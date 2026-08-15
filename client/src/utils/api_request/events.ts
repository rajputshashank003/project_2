/**
 * events.ts — API module for NGO events.
 */
import { request, unwrap } from './utils';
import type { ApiResponse, PaginatedResponse } from './utils';
import type { NGOEvent, CreateEventPayload, UpdateEventPayload } from '../../types/event';

export const getEvents = async (page = 1, limit = 50): Promise<PaginatedResponse<NGOEvent>> => {
    return request<PaginatedResponse<NGOEvent>>({
        url:    '/events',
        method: 'GET',
        params: { page, limit },
    });
};

export const createEvent = async (data: CreateEventPayload): Promise<NGOEvent> => {
    const res = await request<ApiResponse<NGOEvent>>({
        url:    '/events',
        method: 'POST',
        data,
    });
    return unwrap(res);
};

export const updateEvent = async (id: string, data: UpdateEventPayload): Promise<NGOEvent> => {
    const res = await request<ApiResponse<NGOEvent>>({
        url:    `/events/${id}`,
        method: 'PATCH',
        data,
    });
    return unwrap(res);
};

export const deleteEvent = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/events/${id}`, method: 'DELETE' });
};
