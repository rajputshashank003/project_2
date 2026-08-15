/**
 * notices.ts — API module for noticeboard notices.
 */
import { request, unwrap } from './utils';
import type { ApiResponse, PaginatedResponse } from './utils';
import type { Notice, CreateNoticePayload } from '../../types/notice';

export const getNotices = async (page = 1, limit = 50): Promise<PaginatedResponse<Notice>> => {
    return request<PaginatedResponse<Notice>>({
        url:    '/notices',
        method: 'GET',
        params: { page, limit },
    });
};

export const createNotice = async (data: CreateNoticePayload): Promise<Notice> => {
    const res = await request<ApiResponse<Notice>>({
        url:    '/notices',
        method: 'POST',
        data,
    });
    return unwrap(res);
};

export const toggleNoticeActive = async (id: string, isActive: boolean): Promise<Notice> => {
    const res = await request<ApiResponse<Notice>>({
        url:    `/notices/${id}`,
        method: 'PATCH',
        data:   { isActive },
    });
    return unwrap(res);
};

export const deleteNotice = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/notices/${id}`, method: 'DELETE' });
};
