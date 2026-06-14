import type { UserRole } from "@/types/user/role.types";

export const APP_PATHS = {
    public: {
        landing: "/",
        login: "/login",
        register: "/register",
        forgotPassword: "/forgot-password",
    },
    shared: {
        redirect: "/redirect",
    },
    student: {
        dashboard: "/student/dashboard",
    },
    teacher: {
        dashboard: "/teacher/dashboard",
    },
    admin: {
        dashboard: "/admin/dashboard",
    },
} as const;

export function getDashboardPath(role: UserRole) {
    switch (role) {
        case "STUDENT":
            return APP_PATHS.student.dashboard;
        case "TEACHER":
            return APP_PATHS.teacher.dashboard;
        case "ADMIN":
            return APP_PATHS.admin.dashboard;
        default:
            return APP_PATHS.public.landing;
    }
}
