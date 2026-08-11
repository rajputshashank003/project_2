/**
 * users.ts — API module for user management.
 * Uses mock data when no backend is available (VITE_API_BASE_URL not set).
 */
import { request } from './utils';
import { mock_users } from '../../mock/users';
import type { User, UserDesignation } from '../../types/user';

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

let _mock_store: User[] = [...mock_users];

export const getUsers = async (): Promise<User[]> => {
    if (USE_MOCK) {
        return Promise.resolve([..._mock_store]);
    }
    return request<User[]>({ url: '/users', method: 'GET' });
};

export const updateUserDesignation = async (
    id: string,
    designation: UserDesignation
): Promise<User> => {
    if (USE_MOCK) {
        _mock_store = _mock_store.map((u) =>
            u.id === id ? { ...u, designation } : u
        );
        const updated = _mock_store.find((u) => u.id === id)!;
        return Promise.resolve(updated);
    }
    return request<User>({ url: `/users/${id}`, method: 'PATCH', data: { designation } });
};
