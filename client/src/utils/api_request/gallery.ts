/**
 * gallery.ts — API module for gallery images.
 */
import { request, unwrap } from './utils';
import type { ApiResponse, PaginatedResponse } from './utils';
import type { GalleryImage } from '../../types/ngo';

export const getGalleryImages = async (page = 1, limit = 50): Promise<PaginatedResponse<GalleryImage>> => {
    return request<PaginatedResponse<GalleryImage>>({
        url:    '/gallery',
        method: 'GET',
        params: { page, limit },
    });
};

export const uploadGalleryImage = async (data: {
    imageBase64: string;
    caption?: string;
}): Promise<GalleryImage> => {
    const res = await request<ApiResponse<GalleryImage>>({
        url:    '/gallery',
        method: 'POST',
        data,
    });
    return unwrap(res);
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
    await request<unknown>({ url: `/gallery/${id}`, method: 'DELETE' });
};
