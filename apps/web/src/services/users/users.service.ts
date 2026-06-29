import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type { AuthSessionUser } from "@/types/auth/auth.types";
import type { AppUser } from "@/types/user/user.types";
import type { UserRole } from "@/types/user/role.types";

type UserStatus = "ACTIVE" | "INACTIVE";

interface UserApiResponse {
    id: string;
    email?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    role?: string;
    isActive?: boolean;
    is_active?: boolean;
    status?: UserStatus;
    photo?: string | null;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
}

interface UpdateUserPayload {
    role?: UserRole;
    status?: UserStatus;
}

const fallbackUserRole: UserRole = "STUDENT";
const STUDENTS_CACHE_TTL_MS = 5 * 60 * 1000;

let studentsCache: { value: AppUser[]; expiresAt: number } | undefined;
let studentsRequest: Promise<AppUser[]> | undefined;

function isUserRole(role?: string): role is UserRole {
    return (
        role === "STUDENT" ||
        role === "TEACHER" ||
        role === "ADMIN"
    );
}

function toAppUser(user: UserApiResponse): AppUser {
    const isActive =
        user.isActive ??
        user.is_active ??
        user.status === "ACTIVE";

    return {
        id: user.id,
        email: user.email ?? "Sin correo registrado",
        firstName: user.firstName ?? user.first_name,
        lastName: user.lastName ?? user.last_name,
        role: isUserRole(user.role)
            ? user.role
            : fallbackUserRole,
        isActive,
        createdAt: user.createdAt ?? user.created_at,
        updatedAt: user.updatedAt ?? user.updated_at,
    };
}

export async function getCurrentUser() {
    const response = await api.get<AuthSessionUser>(
        endpoints.users.me
    );

    return response.data;
}

export async function getUsers(): Promise<AppUser[]> {
    const response = await api.get<UserApiResponse[]>(endpoints.users.list);

    return response.data.map(toAppUser);
}

export async function getStudents(): Promise<AppUser[]> {
    if (studentsCache && studentsCache.expiresAt > Date.now()) {
        return studentsCache.value;
    }

    if (studentsRequest) {
        return studentsRequest;
    }

    studentsRequest = api.get<UserApiResponse[]>(
        endpoints.users.list,
        {
            params: {
                role: "STUDENT",
                status: "ACTIVE",
            },
        }
    ).then((response) => {
        const students = response.data
            .map(toAppUser)
            .filter((user) => user.role === "STUDENT" && user.isActive);

        studentsCache = {
            value: students,
            expiresAt: Date.now() + STUDENTS_CACHE_TTL_MS,
        };

        return students;
    }).finally(() => {
        studentsRequest = undefined;
    });

    return studentsRequest;
}

export async function updateUser(
    userId: string,
    payload: UpdateUserPayload
): Promise<AppUser> {
    const response = await api.put<UserApiResponse>(
        endpoints.users.detail(userId),
        payload
    );

    studentsCache = undefined;

    return toAppUser(response.data);
}

export async function updateUserStatus(
    userId: string,
    isActive: boolean
): Promise<AppUser> {
    return updateUser(userId, {
        status: isActive ? "ACTIVE" : "INACTIVE",
    });
}

export async function updateUserRole(
    userId: string,
    role: UserRole
): Promise<AppUser> {
    return updateUser(userId, {
        role,
    });
}
