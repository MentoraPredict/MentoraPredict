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
}
