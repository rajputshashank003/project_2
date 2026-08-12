import { request } from './utils';
import { mock_events } from '../../mock/events';
import type { NGOEvent, CreateEventPayload, UpdateEventPayload } from '../../types/event';
import { generateUniqueId } from '../helpers';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

let _mock_store: NGOEvent[] = [...mock_events];

export const getEvents = async (): Promise<NGOEvent[]> => {
    if (USE_MOCK) return Promise.resolve([..._mock_store].reverse());
    return request<NGOEvent[]>({ url: '/events', method: 'GET' });
};

export const createEvent = async (data: CreateEventPayload): Promise<NGOEvent> => {
    if (USE_MOCK) {
        const event: NGOEvent = {
            id: `evt-${generateUniqueId()}`,
            title: data.title,
            description: data.description,
            images: data.images.map((img, i) => ({
                id: `ei-${generateUniqueId()}-${i}`,
                imageUrl: img.imageBase64,
                caption: img.caption,
            })),
            createdAt: new Date().toISOString(),
            createdBy: 'admin',
        };
        _mock_store = [event, ..._mock_store];
        return Promise.resolve(event);
    }
    return request<NGOEvent>({ url: '/events', method: 'POST', data });
};

export const updateEvent = async (id: string, data: UpdateEventPayload): Promise<NGOEvent> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((e) => {
            if (e.id !== id) return e;
            return {
                ...e,
                title: data.title ?? e.title,
                description: data.description ?? e.description,
                images: data.images
                    ? data.images.map((img, i) => ({
                          id: `ei-${generateUniqueId()}-${i}`,
                          imageUrl: img.imageBase64,
                          caption: img.caption,
                      }))
                    : e.images,
            };
        });
        return Promise.resolve(_mock_store.find((e) => e.id === id)!);
    }
    return request<NGOEvent>({ url: `/events/${id}`, method: 'PATCH', data });
};

export const deleteEvent = async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.filter((e) => e.id !== id);
        return Promise.resolve({ success: true });
    }
    return request<{ success: boolean }>({ url: `/events/${id}`, method: 'DELETE' });
};
