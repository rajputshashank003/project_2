/**
 * gallery.ts — API module for gallery images.
 * Uses mock data when no backend is available (VITE_API_BASE_URL not set).
 */
import { request } from './utils';
import { mock_gallery_images } from '../../mock/gallery';
import type { GalleryImage } from '../../types/ngo';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

let _mock_store: GalleryImage[] = [...mock_gallery_images];

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
    if (USE_MOCK) {
        return Promise.resolve([..._mock_store]);
    }
    return request<GalleryImage[]>({ url: '/gallery', method: 'GET' });
};

export const uploadGalleryImage = async (data: {
    imageBase64: string;
    caption?: string;
}): Promise<GalleryImage> => {
    if (USE_MOCK) {
        const image: GalleryImage = {
            id:         `img-${Date.now()}`,
            imageUrl:   data.imageBase64,
            caption:    data.caption,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'admin',
        };
        _mock_store = [image, ..._mock_store];
        return Promise.resolve(image);
    }
    return request<GalleryImage>({ url: '/gallery', method: 'POST', data });
};

export const deleteGalleryImage = async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.filter((img) => img.id !== id);
        return Promise.resolve({ success: true });
    }
    return request<{ success: boolean }>({ url: `/gallery/${id}`, method: 'DELETE' });
};
