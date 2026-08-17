import { useState, useEffect, useCallback } from "react";
import { getUsers, updateUserDesignation } from "../../utils/api_request/users";
import type { User, UserDesignation } from "../../types/user";

export const useAdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const loadUsers = useCallback(
        async (
            targetPage = 1,
            bg = selectedBloodGroup,
            search = searchQuery,
        ) => {
            setIsLoading(true);
            try {
                const bloodParam = bg === "all" ? undefined : bg;
                const result = await getUsers(targetPage, 20, bloodParam, search);
                setUsers(result.data);
                setPage(result.pagination?.page || targetPage);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotalCount(result.pagination?.total || result.data.length);
            } catch {
                // error toast already shown by axiosInstance interceptor
            } finally {
                setIsLoading(false);
            }
        },
        [selectedBloodGroup, searchQuery],
    );

    // Debounced search & filter effect
    useEffect(() => {
        const timer = setTimeout(() => {
            void loadUsers(1, selectedBloodGroup, searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedBloodGroup, searchQuery, loadUsers]);

    const filteredUsers = users;

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
        page,
        totalPages,
        totalCount,
        setSearchQuery,
        setSelectedBloodGroup,
        handleDesignationChange,
        loadUsers,
    };
};

export type ReturnTypeOfUseAdminUsers = ReturnType<typeof useAdminUsers>;

