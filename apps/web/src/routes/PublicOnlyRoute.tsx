import { Navigate, Outlet } from "react-router-dom";

import { APP_PATHS, getDashboardPath } from "./paths";
import { useAuthStore } from "@/store/auth.store";

export default function PublicOnlyRoute() {
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

    if (isAuthenticated && user) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return <Outlet />;
}
