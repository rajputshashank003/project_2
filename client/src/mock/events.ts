import type { NGOEvent } from '../types/event';

export const mock_events: NGOEvent[] = [
  {
    id: 'evt-001',
    title: 'Annual Charity Drive 2024',
    description: 'Our flagship annual fundraiser brought together volunteers and donors from across the region to support underprivileged communities. The event featured cultural programs, awareness drives, and a donation campaign that raised over ₹5 lakhs.',
    images: [
      { id: 'ei-001', imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80', caption: 'Opening ceremony' },
      { id: 'ei-002', imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80', caption: 'Volunteers in action' },
      { id: 'ei-003', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', caption: 'Community gathering' },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'admin',
  },
  {
    id: 'evt-002',
    title: 'Tree Plantation Drive',
    description: 'Over 200 volunteers planted 1,000 saplings across 5 locations in the city as part of our green initiative. Each sapling was tagged and will be monitored for growth over the next year.',
    images: [
      { id: 'ei-004', imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80', caption: 'Planting saplings' },
      { id: 'ei-005', imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80', caption: 'Green initiative' },
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'admin',
  },
  {
    id: 'evt-003',
    title: 'Health & Wellness Camp',
    description: 'A free medical camp conducted in collaboration with local hospitals, providing health check-ups, medicines, and consultations to over 500 beneficiaries from low-income families.',
    images: [
      { id: 'ei-006', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', caption: 'Medical check-up' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'admin',
  },
];
