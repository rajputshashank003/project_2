import type { User } from '../types/user';

export const mock_users: User[] = [
    {
        id: 'user-001',
        phone: '9876543210',
        name: 'Ramesh Kumar',
        email: 'ramesh@email.com',
        role: 'user',
        designation: 'member',
        joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        isActive: true,
    },
    {
        id: 'user-002',
        phone: '9123456789',
        name: 'Priya Sharma',
        email: 'priya@email.com',
        role: 'user',
        designation: 'volunteer',
        joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        isActive: true,
    },
    {
        id: 'user-003',
        phone: '9988776655',
        name: 'Amit Singh',
        email: 'amit@email.com',
        role: 'user',
        designation: 'secretary',
        joinedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        isActive: true,
    },
    {
        id: 'admin-001',
        phone: '9000000000',
        name: 'Admin User',
        email: 'admin@ngo.org',
        role: 'admin',
        designation: 'admin',
        joinedAt: new Date(Date.now() - 86400000 * 365).toISOString(),
        isActive: true,
    },
];
