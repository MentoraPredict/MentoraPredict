export const USER_ROLES = [
    "STUDENT",
    "TEACHER",
    "ADMIN",
] as const;

export type UserRole =
    (typeof USER_ROLES)[number];
