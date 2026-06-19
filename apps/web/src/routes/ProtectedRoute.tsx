import { Navigate, Outlet, useLocation } from "react-router-dom";

import { APP_PATHS, getDashboardPath } from "./paths";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/user/role.types";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
    allowedRoles,
}: ProtectedRouteProps) {
    const location = useLocation();
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );
    const isHydrated = useAuthStore(
        (state) => state.isHydrated
    );
    const user = useAuthStore((state) => state.user);

    if (!isHydrated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Cargando...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={APP_PATHS.public.login}
                replace
                state={{ from: location }}
            />
        );
    }

    if (
        allowedRoles &&
        user &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return <Outlet />;
}
