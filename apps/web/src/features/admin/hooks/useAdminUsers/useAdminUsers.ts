import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    getUsers,
    updateUser,
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
        user.facultyName,
        user.careerName,
        user.semester,
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
    const [roleFilter, setRoleFilter] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [careerFilter, setCareerFilter] = useState("");
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
        const normalizedRole = roleFilter.trim().toLowerCase();
        const normalizedFaculty = facultyFilter.trim().toLowerCase();
        const normalizedCareer = careerFilter.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !normalizedSearch ||
                getUserSearchText(user).includes(normalizedSearch);
            const matchesRole =
                !normalizedRole || user.role.toLowerCase() === normalizedRole;
            const matchesFaculty =
                !normalizedFaculty ||
                (user.facultyName ?? "")
                    .toLowerCase()
                    .includes(normalizedFaculty);
            const matchesCareer =
                !normalizedCareer ||
                (user.careerName ?? "")
                    .toLowerCase()
                    .includes(normalizedCareer);

            return (
                matchesSearch &&
                matchesRole &&
                matchesFaculty &&
                matchesCareer
            );
        });
    }, [careerFilter, facultyFilter, roleFilter, search, users]);

    const filterOptions = useMemo(() => {
        const faculties = Array.from(
            new Set(
                users
                    .map((user) => user.facultyName?.trim())
                    .filter((value): value is string => Boolean(value))
            )
        ).sort((a, b) => a.localeCompare(b));

        const careers = Array.from(
            new Set(
                users
                    .map((user) => user.careerName?.trim())
                    .filter((value): value is string => Boolean(value))
            )
        ).sort((a, b) => a.localeCompare(b));

        return { faculties, careers };
    }, [users]);

    const clearSearch = useCallback(() => {
        setSearch("");
    }, []);

    const clearFilters = useCallback(() => {
        setSearch("");
        setRoleFilter("");
        setFacultyFilter("");
        setCareerFilter("");
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

    const saveUserProfile = useCallback(
        async (
            userId: string,
            payload: {
                email?: string;
                firstName?: string;
                lastName?: string;
            }
        ) => {
            setError(null);

            try {
                const updatedUser = await updateUser(userId, payload);
                replaceUser(updatedUser);
                return updatedUser;
            } catch (requestError) {
                setError(
                    getRequestErrorMessage(
                        "No se pudo actualizar la informacion del usuario.",
                        requestError
                    )
                );
                throw requestError;
            }
        },
        [replaceUser]
    );

    return {
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        facultyFilter,
        setFacultyFilter,
        careerFilter,
        setCareerFilter,
        filterOptions,
        users: filteredUsers,
        isLoading,
        error,
        reload: loadUsers,
        clearSearch,
        clearFilters,
        toggleStatus,
        toggleTeacherRole,
        saveUserProfile,
    };
}
