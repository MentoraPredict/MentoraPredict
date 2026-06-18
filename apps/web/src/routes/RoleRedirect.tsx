import { Navigate } from "react-router-dom";

import { APP_PATHS, getDashboardPath } from "./paths";
import { useAuthStore } from "@/store/auth.store";

export default function RoleRedirect() {
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

    if (!user) {
        return (
            <Navigate
                to={APP_PATHS.public.login}
                replace
            />
        );
    }

    return (
        <Navigate
            to={getDashboardPath(user.role)}
            replace
        />
    );
}
