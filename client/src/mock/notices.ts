import type { Notice } from '../types/notice';

export const mock_notices: Notice[] = [
    {
        id: 'notice-001',
        title: 'Annual Charity Drive 2024',
        content:
            'Join us for our biggest fundraising event of the year. Together we can make a difference in thousands of lives across the country.',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        createdBy: 'admin',
    },
    {
        id: 'notice-002',
        title: 'Volunteer Registration Open — Season 2024',
        content:
            'We are accepting new volunteers for the upcoming season. Register today and be part of our growing family of changemakers.',
        imageUrl: '',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'admin',
    },
    {
        id: 'notice-003',
        title: 'Tree Plantation Drive — This Sunday',
        content:
            'Join us this Sunday at City Park for a community tree plantation drive. Let us together plant 500 trees for a greener tomorrow.',
        imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
    },
];
