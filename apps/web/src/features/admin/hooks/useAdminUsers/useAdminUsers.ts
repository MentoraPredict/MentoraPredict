import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
    createUserWithRole,
    deleteUser,
    deleteUserAvatar,
    getUsers,
    PartialUserCreationError,
    updateUser,
    updateUserRole,
    updateUserStatus,
    uploadUserAvatar,
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

function useRoleScopedUsers(role: UserRole, search: string) {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getUsers({
                page: currentPage,
                limit: USERS_PAGE_SIZE,
                search,
                role,
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
    }, [currentPage, role, search]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return {
        users,
        isLoading,
        error,
        currentPage,
        pageSize: USERS_PAGE_SIZE,
        totalUsers,
        totalPages,
        setCurrentPage,
        reload: load,
    };
}

export default function useAdminUsers() {
    const [search, setSearch] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [careerFilter, setCareerFilter] = useState("");
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [createUserError, setCreateUserError] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);

    const admins = useRoleScopedUsers("ADMIN", search);
    const teachers = useRoleScopedUsers("TEACHER", search);
    const students = useRoleScopedUsers("STUDENT", search);

    const reloadAll = useCallback(async () => {
        await Promise.all([admins.reload(), teachers.reload(), students.reload()]);
    }, [admins, teachers, students]);

    const filteredStudents = useMemo(() => {
        const normalizedFaculty = facultyFilter.trim().toLowerCase();
        const normalizedCareer = careerFilter.trim().toLowerCase();

        return students.users.filter((user) => {
            const matchesFaculty =
                !normalizedFaculty ||
                (user.facultyName ?? "").toLowerCase().includes(normalizedFaculty);
            const matchesCareer =
                !normalizedCareer ||
                (user.careerName ?? "").toLowerCase().includes(normalizedCareer);

            return matchesFaculty && matchesCareer;
        });
    }, [careerFilter, facultyFilter, students.users]);

    const studentFilterOptions = useMemo(() => {
        const faculties = Array.from(
            new Set(
                students.users
                    .map((user) => user.facultyName?.trim())
                    .filter((value): value is string => Boolean(value))
            )
        ).sort((a, b) => a.localeCompare(b));

        const careers = Array.from(
            new Set(
                students.users
                    .map((user) => user.careerName?.trim())
                    .filter((value): value is string => Boolean(value))
            )
        ).sort((a, b) => a.localeCompare(b));

        return { faculties, careers };
    }, [students.users]);

    const clearSearch = useCallback(() => {
        setSearch("");
    }, []);

    const clearStudentFilters = useCallback(() => {
        setFacultyFilter("");
        setCareerFilter("");
    }, []);

    const toggleStatus = useCallback(
        async (userId: string) => {
            const user = [...admins.users, ...teachers.users, ...students.users].find(
                (currentUser) => currentUser.id === userId
            );

            if (!user) {
                return;
            }

            setMutationError(null);

            try {
                await updateUserStatus(userId, !user.isActive);
                await reloadAll();
            } catch (requestError) {
                setMutationError(
                    getRequestErrorMessage(
                        "No se pudo actualizar el estado del usuario.",
                        requestError
                    )
                );
            }
        },
        [admins.users, teachers.users, students.users, reloadAll]
    );

    const toggleTeacherRole = useCallback(
        async (userId: string) => {
            const user = [...teachers.users, ...students.users].find(
                (currentUser) => currentUser.id === userId
            );

            if (!user) {
                return;
            }

            setMutationError(null);

            try {
                await updateUserRole(
                    userId,
                    user.role === "STUDENT" ? "TEACHER" : "STUDENT"
                );
                await reloadAll();
            } catch (requestError) {
                setMutationError(
                    getRequestErrorMessage(
                        "No se pudo actualizar el rol del usuario.",
                        requestError
                    )
                );
            }
        },
        [teachers.users, students.users, reloadAll]
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
            setMutationError(null);

            try {
                const updatedUser = await updateUser(userId, payload);
                await reloadAll();
                return updatedUser;
            } catch (requestError) {
                setMutationError(
                    getRequestErrorMessage(
                        "No se pudo actualizar la informacion del usuario.",
                        requestError
                    )
                );
                throw requestError;
            }
        },
        [reloadAll]
    );

    const uploadAvatar = useCallback(
        async (userId: string, file: File) => {
            setMutationError(null);

            try {
                const updatedUser = await uploadUserAvatar(userId, file);
                await reloadAll();
                return updatedUser;
            } catch (requestError) {
                setMutationError(
                    getRequestErrorMessage(
                        "No se pudo actualizar la foto de perfil.",
                        requestError
                    )
                );
                throw requestError;
            }
        },
        [reloadAll]
    );

    const deleteAvatar = useCallback(
        async (userId: string) => {
            setMutationError(null);

            try {
                const updatedUser = await deleteUserAvatar(userId);
                await reloadAll();
                return updatedUser;
            } catch (requestError) {
                setMutationError(
                    getRequestErrorMessage(
                        "No se pudo eliminar la foto de perfil.",
                        requestError
                    )
                );
                throw requestError;
            }
        },
        [reloadAll]
    );

    const createUser = useCallback(
        async (payload: CreateUserWithRolePayload, avatarFile?: File) => {
            setCreateUserError(null);
            setIsCreatingUser(true);

            try {
                const created = await createUserWithRole(payload);
                if (avatarFile) {
                    await uploadUserAvatar(created.id, avatarFile).catch(() => null);
                }
                await reloadAll();
                return true;
            } catch (requestError) {
                if (requestError instanceof PartialUserCreationError) {
                    // The user was still created (as STUDENT) — refresh the
                    // tables so it shows up, but keep the modal open with the
                    // message so the admin knows the role needs a manual fix.
                    await reloadAll();
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
        [reloadAll]
    );

    const clearCreateUserError = useCallback(() => {
        setCreateUserError(null);
    }, []);

    const removeUser = useCallback(
        async (userId: string) => {
            setMutationError(null);
            setDeletingUserId(userId);

            try {
                await deleteUser(userId);
                await reloadAll();
                return true;
            } catch (requestError) {
                setMutationError(
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
        [reloadAll]
    );

    return {
        search,
        setSearch,
        clearSearch,
        mutationError,
        admins: {
            users: admins.users,
            isLoading: admins.isLoading,
            error: admins.error,
            currentPage: admins.currentPage,
            pageSize: admins.pageSize,
            totalUsers: admins.totalUsers,
            totalPages: admins.totalPages,
            setCurrentPage: admins.setCurrentPage,
        },
        teachers: {
            users: teachers.users,
            isLoading: teachers.isLoading,
            error: teachers.error,
            currentPage: teachers.currentPage,
            pageSize: teachers.pageSize,
            totalUsers: teachers.totalUsers,
            totalPages: teachers.totalPages,
            setCurrentPage: teachers.setCurrentPage,
        },
        students: {
            users: filteredStudents,
            isLoading: students.isLoading,
            error: students.error,
            currentPage: students.currentPage,
            pageSize: students.pageSize,
            totalUsers: students.totalUsers,
            totalPages: students.totalPages,
            setCurrentPage: students.setCurrentPage,
            facultyFilter,
            setFacultyFilter,
            careerFilter,
            setCareerFilter,
            filterOptions: studentFilterOptions,
            clearFilters: clearStudentFilters,
        },
        toggleStatus,
        toggleTeacherRole,
        saveUserProfile,
        uploadAvatar,
        deleteAvatar,
        createUser,
        isCreatingUser,
        createUserError,
        clearCreateUserError,
        deletingUserId,
        removeUser,
    };
}
