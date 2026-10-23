export const USER_ROLES = [
    "STUDENT",
    "TEACHER",
    "ADMIN",
    "GUARDIAN",
    "SECRETARY",
    "DECE",
    "INSPECTOR",
] as const;

export type UserRole =
    (typeof USER_ROLES)[number];
