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
    lastName?: string;
    role?: string;
    isActive?: boolean;
    status?: UserStatus;
    photo?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface UpdateUserPayload {
    role?: UserRole;
    status?: UserStatus;
}

const fallbackUserRole: UserRole = "STUDENT";

function isUserRole(role?: string): role is UserRole {
    return (
        role === "STUDENT" ||
        role === "TEACHER" ||
        role === "ADMIN"
    );
}

function toAppUser(user: UserApiResponse): AppUser {
    const isActive =
        user.isActive ?? user.status === "ACTIVE";

    return {
        id: user.id,
        email: user.email ?? "Sin correo registrado",
        firstName: user.firstName,
        lastName: user.lastName,
        role: isUserRole(user.role)
            ? user.role
            : fallbackUserRole,
        isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export async function getCurrentUser() {
    const response = await api.get<AuthSessionUser>(
        endpoints.users.me
    );

    return response.data;
}

export async function getUsers(): Promise<AppUser[]> {
    const response = await api.get<UserApiResponse[]>(
        endpoints.users.list,
        {
            params: {
                _t: Date.now(),
            },
        }
    );

    return response.data.map(toAppUser);
}

export async function updateUser(
    userId: string,
    payload: UpdateUserPayload
): Promise<AppUser> {
    const response = await api.put<UserApiResponse>(
        endpoints.users.detail(userId),
        payload
    );

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
