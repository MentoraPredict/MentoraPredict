import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    getUsers,
    updateUserRole,
    updateUserStatus,
} from "@/services/users/users.service";
import type { AppUser } from "@/types/user/user.types";

function getUserSearchText(user: AppUser) {
    return [
        user.firstName,
        user.lastName,
        user.email,
        user.role,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

function getRequestErrorMessage(
    fallbackMessage: string,
    error: unknown
) {
    if (!axios.isAxiosError(error)) {
        return fallbackMessage;
    }

    const status = error.response?.status;

    if (!status) {
        return `${fallbackMessage} No hubo respuesta de Kong o del backend.`;
    }

    return `${fallbackMessage} Codigo HTTP: ${status}.`;
}

export default function useAdminUsers() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const loadedUsers = await getUsers();
            setUsers(loadedUsers);
        } catch (requestError) {
            setError(
                getRequestErrorMessage(
                    "No se pudieron cargar los usuarios. Intenta nuevamente.",
                    requestError
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return users;
        }

        return users.filter((user) =>
            getUserSearchText(user).includes(normalizedSearch)
        );
    }, [search, users]);

    const clearSearch = useCallback(() => {
        setSearch("");
    }, []);

    const replaceUser = useCallback((updatedUser: AppUser) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === updatedUser.id ? updatedUser : user
            )
        );
    }, []);

    const toggleStatus = useCallback(
        async (userId: string) => {
            const user = users.find(
                (currentUser) => currentUser.id === userId
            );

            if (!user) {
                return;
            }

            setError(null);

            try {
                const updatedUser = await updateUserStatus(
                    userId,
                    !user.isActive
                );
                replaceUser(updatedUser);
            } catch (requestError) {
                setError(
                    getRequestErrorMessage(
                        "No se pudo actualizar el estado del usuario.",
                        requestError
                    )
                );
            }
        },
        [replaceUser, users]
    );

    const toggleTeacherRole = useCallback(
        async (userId: string) => {
            const user = users.find(
                (currentUser) => currentUser.id === userId
            );

            if (!user || user.role === "ADMIN") {
                return;
            }

            setError(null);

            try {
                const updatedUser = await updateUserRole(
                    userId,
                    user.role === "STUDENT" ? "TEACHER" : "STUDENT"
                );
                replaceUser(updatedUser);
            } catch (requestError) {
                setError(
                    getRequestErrorMessage(
                        "No se pudo actualizar el rol del usuario.",
                        requestError
                    )
                );
            }
        },
        [replaceUser, users]
    );

    return {
        search,
        setSearch,
        users: filteredUsers,
        isLoading,
        error,
        reload: loadUsers,
        clearSearch,
        toggleStatus,
        toggleTeacherRole,
    };
}
