import { useState, useEffect } from 'react';
import { getUsers, updateUserDesignation } from '../../utils/api_request/users';
import filter from 'lodash/filter';
import type { User, UserDesignation } from '../../types/user';

export const useAdminUsers = () => {
    const [users, setUsers]             = useState<User[]>([]);
    const [isLoading, setIsLoading]     = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = searchQuery.trim()
        ? filter(
              users,
              (u) =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.phone.includes(searchQuery) ||
                  (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        : users;

    const handleDesignationChange = async (userId: string, designation: UserDesignation) => {
        // Optimistic update
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, designation } : u))
        );
        await updateUserDesignation(userId, designation);
    };

    return {
        users,
        filteredUsers,
        isLoading,
        searchQuery,
        setSearchQuery,
        handleDesignationChange,
        loadUsers,
    };
};

export type ReturnTypeOfUseAdminUsers = ReturnType<typeof useAdminUsers>;
