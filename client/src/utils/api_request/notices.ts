/**
 * notices.ts — API module for noticeboard notices.
 * Uses mock data when no backend is available (VITE_API_BASE_URL not set).
 * When the backend is ready, remove the mock block and uncomment the real calls.
 */
import { request } from './utils';
import { mock_notices } from '../../mock/notices';
import type { Notice, CreateNoticePayload } from '../../types/notice';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

// In-memory store so create/delete/toggle mutate mock state during the session
let _mock_store: Notice[] = [...mock_notices];

export const getNotices = async (): Promise<Notice[]> => {
    if (USE_MOCK) {
        return Promise.resolve([..._mock_store]);
    }
    return request<Notice[]>({ url: '/notices', method: 'GET' });
};

export const createNotice = async (data: CreateNoticePayload): Promise<Notice> => {
    if (USE_MOCK) {
        const notice: Notice = {
            id:        `notice-${Date.now()}`,
            title:     data.title,
            content:   data.content,
            imageUrl:  data.imageBase64 || '',
            isActive:  data.isActive,
            createdAt: new Date().toISOString(),
            createdBy: 'admin',
        };
        _mock_store = [notice, ..._mock_store];
        return Promise.resolve(notice);
    }
    return request<Notice>({ url: '/notices', method: 'POST', data });
};

export const toggleNoticeActive = async (id: string, isActive: boolean): Promise<Notice> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((n) => n.id === id ? { ...n, isActive } : n);
        const updated = _mock_store.find((n) => n.id === id)!;
        return Promise.resolve(updated);
    }
    return request<Notice>({ url: `/notices/${id}`, method: 'PATCH', data: { isActive } });
};

export const deleteNotice = async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.filter((n) => n.id !== id);
        return Promise.resolve({ success: true });
    }
    return request<{ success: boolean }>({ url: `/notices/${id}`, method: 'DELETE' });
};
