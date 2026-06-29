export const endpoints = {
    auth: {
        login: "/v1/auth/login",
        logout: "/v1/auth/logout",
        refresh: "/v1/auth/refresh",
        register: "/v1/auth/register",
        forgotPassword: "/v1/auth/forgot-password",
        resetPassword: "/v1/auth/reset-password",
    },
    users: {
        me: "/v1/users/me",
        list: "/v1/users",
        detail: (id: string) => `/v1/users/${id}`,
    },
    academic: {
        subjects: "/v1/academic/subjects",
        subject: (id: string) => `/v1/academic/subjects/${id}`,
        faculties: "/v1/academic/faculties",
        periods: "/v1/academic/periods",
        activePeriod: "/v1/academic/periods/active",
        careers: "/v1/academic/careers",
        enrollments: "/v1/academic/enrollments",
        importGrades: "/v1/academic/import/grades",
    },
    analytics: {
        studentDashboard: (studentId: string) =>
            `/v1/analytics/dashboard/student/${studentId}`,
    },
} as const;
