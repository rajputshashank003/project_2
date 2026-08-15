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

export const createEvent = async (data: CreateEventPayload | FormData): Promise<NGOEvent> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        body.append('title', data.title);
        body.append('description', data.description);
        data.images.forEach((img) => {
            if (img.type === 'new') {
                body.append('images', img.file);
                body.append('captions', img.caption || '');
            } else {
                body.append('existingUrls', img.url);
                body.append('existingCaptions', img.caption || '');
            }
        });
    }
    const res = await request<ApiResponse<NGOEvent>>({
        url:    '/events',
        method: 'POST',
        data:   body,
    });
    return unwrap(res);
};

export const updateEvent = async (id: string, data: UpdateEventPayload | FormData): Promise<NGOEvent> => {
    let body: FormData;
    if (data instanceof FormData) {
        body = data;
    } else {
        body = new FormData();
        if (data.title) body.append('title', data.title);
        if (data.description) body.append('description', data.description);
        if (data.images) {
            data.images.forEach((img) => {
                if (img.type === 'new') {
                    body.append('images', img.file);
                    body.append('captions', img.caption || '');
                } else {
                    body.append('existingUrls', img.url);
                    body.append('existingCaptions', img.caption || '');
                }
            });
        }
    }
    const res = await request<ApiResponse<NGOEvent>>({
        url:    `/events/${id}`,
        method: 'PATCH',
        data:   body,
    });
    return unwrap(res);
};

export const deleteEvent = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/events/${id}`, method: 'DELETE' });
};
