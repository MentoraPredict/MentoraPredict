import { Navigate } from "react-router-dom";

import Spinner from "@/components/atoms/Spinner";
import Text from "@/components/atoms/Text";
import { APP_PATHS, getDashboardPath } from "./paths";
import { useAuthStore } from "@/store/auth.store";

export default function RoleRedirect() {
    const isHydrated = useAuthStore(
        (state) => state.isHydrated
    );
    const user = useAuthStore((state) => state.user);

    if (!isHydrated) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-blue-700">
                <Spinner size={32} />
                <Text variant="small" className="text-gray-600">
                    Cargando tu panel...
                </Text>
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
