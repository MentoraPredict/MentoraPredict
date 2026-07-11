import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    createUserWithRole,
    deleteUser,
    getUsers,
    PartialUserCreationError,
    updateUser,
    updateUserRole,
    updateUserStatus,
    type CreateUserWithRolePayload,
} from "@/services/users/users.service";
import type { AppUser } from "@/types/user/user.types";
import type { UserRole } from "@/types/user/role.types";

const USERS_PAGE_SIZE = 10;

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
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [createUserError, setCreateUserError] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getUsers({
                page: currentPage,
                limit: USERS_PAGE_SIZE,
                search,
                role: roleFilter as UserRole | "",
            });
            setUsers(result.data);
            setTotalUsers(result.total);
            setTotalPages(result.totalPages);
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
    }, [currentPage, roleFilter, search]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [careerFilter, facultyFilter, roleFilter, search]);

    const filteredUsers = useMemo(() => {
        const normalizedRole = roleFilter.trim().toLowerCase();
        const normalizedFaculty = facultyFilter.trim().toLowerCase();
        const normalizedCareer = careerFilter.trim().toLowerCase();

        return users.filter((user) => {
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
                matchesRole &&
                matchesFaculty &&
                matchesCareer
            );
        });
    }, [careerFilter, facultyFilter, roleFilter, users]);

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
        setCurrentPage(1);
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

    const createUser = useCallback(
        async (payload: CreateUserWithRolePayload) => {
            setCreateUserError(null);
            setIsCreatingUser(true);

            try {
                await createUserWithRole(payload);
                await loadUsers();
                return true;
            } catch (requestError) {
                if (requestError instanceof PartialUserCreationError) {
                    // The user was still created (as STUDENT) — refresh the
                    // table so it shows up, but keep the modal open with the
                    // message so the admin knows the role needs a manual fix.
                    await loadUsers();
                    setCreateUserError(requestError.message);
                    return false;
                }

                setCreateUserError(
                    getRequestErrorMessage(
                        "No se pudo crear el usuario.",
                        requestError
                    )
                );
                return false;
            } finally {
                setIsCreatingUser(false);
            }
        },
        [loadUsers]
    );

    const clearCreateUserError = useCallback(() => {
        setCreateUserError(null);
    }, []);

    const removeUser = useCallback(
        async (userId: string) => {
            setError(null);
            setDeletingUserId(userId);

            try {
                await deleteUser(userId);
                await loadUsers();
                return true;
            } catch (requestError) {
                setError(
                    getRequestErrorMessage(
                        "No se pudo eliminar el usuario.",
                        requestError
                    )
                );
                return false;
            } finally {
                setDeletingUserId(null);
            }
        },
        [loadUsers]
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
        allUsers: users,
        currentPage,
        pageSize: USERS_PAGE_SIZE,
        totalUsers,
        totalPages,
        setCurrentPage,
        isLoading,
        error,
        reload: loadUsers,
        clearSearch,
        clearFilters,
        toggleStatus,
        toggleTeacherRole,
        saveUserProfile,
        createUser,
        isCreatingUser,
        createUserError,
        clearCreateUserError,
        deletingUserId,
        removeUser,
    };
}
