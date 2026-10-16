export const USER_ROLES = [
    "STUDENT",
    "TEACHER",
    "ADMIN",
    "GUARDIAN",
    "SECRETARY",
] as const;

export type UserRole =
    (typeof USER_ROLES)[number];
