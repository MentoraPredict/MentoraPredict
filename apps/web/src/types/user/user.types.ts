import type { UserRole } from "./role.types";

export interface AppUser {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    avatarUrl?: string | null;
    cedula?: string | null;
    bio?: string | null;
    deletedAt?: string | null;
    semester?: string;
}
