import type { GalleryImage } from '../types/ngo';

export const mock_gallery_images: GalleryImage[] = [
    {
        id: 'img-001',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
        caption: 'Community Outreach',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        uploadedBy: 'admin',
    },
    {
        id: 'img-002',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
        caption: 'Food Distribution Drive',
        uploadedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        uploadedBy: 'admin',
    },
    {
        id: 'img-003',
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80',
        caption: 'Education Program',
        uploadedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        uploadedBy: 'admin',
    },
    {
        id: 'img-004',
        imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
        caption: 'Annual Meetup',
        uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        uploadedBy: 'admin',
    },
    {
        id: 'img-005',
        imageUrl: 'https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?w=600&q=80',
        caption: 'Health Camp',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        uploadedBy: 'admin',
    },
    {
        id: 'img-006',
        imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80',
        caption: 'Tree Plantation',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
    },
];
