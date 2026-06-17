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
    },
} as const;
