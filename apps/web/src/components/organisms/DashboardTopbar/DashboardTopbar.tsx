import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { Button, Container, Logo, Text } from "@/components/atoms";
import { useAuthStore } from "@/store/auth.store";
import { APP_PATHS } from "@/routes/paths";

interface DashboardTopbarProps {
    title: string;
}

export default function DashboardTopbar({
    title,
}: DashboardTopbarProps) {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
            navigate(APP_PATHS.public.login, {
                replace: true,
            });
        }
    };

    return (
        <header className="border-b border-gray-200 bg-white">
            <Container>
                <div className="flex h-20 items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <div>
                            <Text variant="small" className="leading-tight">
                                {title}
                            </Text>
                            {user ? (
                                <Text
                                    variant="caption"
                                    className="leading-tight"
                                >
                                    {user.email}
                                </Text>
                            ) : null}
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="gap-2"
                    >
                        <FiLogOut />
                        {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
                    </Button>
                </div>
            </Container>
        </header>
    );
}
