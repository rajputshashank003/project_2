import { useState, useEffect } from "react";
import { getUsers, updateUserDesignation } from "../../utils/api_request/users";
import filter from "lodash/filter";
import type { User, UserDesignation } from "../../types/user";

export const useAdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("all");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const result = await getUsers();
            setUsers(result.data);
        } catch {
            // error toast already shown by axiosInstance interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = filter(users, (u) => {
        const matchesBloodGroup =
            selectedBloodGroup === "all" ||
            (selectedBloodGroup === "Unknown"
                ? !u.bloodGroup || u.bloodGroup === "Unknown"
                : u.bloodGroup === selectedBloodGroup);

        if (!matchesBloodGroup) return false;

        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        return (
            u.name.toLowerCase().includes(q) ||
            u.phone.includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.bloodGroup || "").toLowerCase().includes(q)
        );
    });

    const handleDesignationChange = async (
        userId: string,
        designation: UserDesignation,
    ) => {
        // Optimistic update
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, designation } : u)),
        );
        await updateUserDesignation(userId, designation);
    };

    return {
        users,
        filteredUsers,
        isLoading,
        searchQuery,
        selectedBloodGroup,
        setSearchQuery,
        setSelectedBloodGroup,
        handleDesignationChange,
        loadUsers,
    };
};

export type ReturnTypeOfUseAdminUsers = ReturnType<typeof useAdminUsers>;
