import { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import IconButton from "@/components/atoms/IconButton";
import Logo from "@/components/atoms/Logo";

import HelpDialog from "@/components/molecules/HelpDialog";
import NotificationIconButton from "@/components/molecules/NotificationIconButton";
import ProfileDropdown from "@/components/molecules/ProfileDropdown";
import RouterNavItem from "@/components/molecules/RouterNavItem";
import UserWelcomeMessage from "@/components/molecules/UserWelcomeMessage";

import useLogout from "@/hooks/useLogout";
import { APP_PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";

export default function AdminNavbar() {
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, handleLogout } = useLogout();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header
        className="
                    border-b
                    border-gray-200
                    bg-white
                "
      >
        <Container>
          <div
            className="
                            flex
                            h-20
                            items-center
                            justify-between
                            gap-6
                        "
          >
            <div className="flex items-center gap-6">
              <Logo />

              <UserWelcomeMessage
                firstName={user?.firstName}
                lastName={user?.lastName}
              />
            </div>

            <nav
              className="
                                hidden
                                items-center
                                gap-8
                                md:flex
                            "
            >
              <RouterNavItem label="Usuarios" to={APP_PATHS.admin.users} />

              <RouterNavItem label="Cursos" to={APP_PATHS.admin.courses} />
            </nav>

            <div className="flex items-center gap-3">
              <IconButton
                type="button"
                onClick={() => {
                  setIsHelpOpen(true);
                }}
                className="
                                    text-gray-600
                                    hover:text-blue-700
                                "
              >
                <FiHelpCircle size={18} />
              </IconButton>

              <NotificationIconButton />

              <div className="h-8 w-px bg-gray-200" />

              <ProfileDropdown
                firstName={user?.firstName}
                lastName={user?.lastName}
                role={user?.role}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </Container>
      </header>

      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => {
          setIsHelpOpen(false);
        }}
      />
    </>
  );
}
