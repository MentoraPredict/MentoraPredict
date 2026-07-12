import { ReactNode, useState } from "react";
import { FiHelpCircle } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import IconButton from "@/components/atoms/IconButton";

import HelpDialog from "@/components/molecules/HelpDialog";
import LogoLink from "@/components/molecules/LogoLink";
import ProfileDropdown from "@/components/molecules/ProfileDropdown";
import RouterNavItem from "@/components/molecules/RouterNavItem";
import UserWelcomeMessage from "@/components/molecules/UserWelcomeMessage";

import useLogout from "@/hooks/useLogout";
import NotificationsMenu from "@/features/notifications/components/NotificationsMenu";
import { useAuthStore } from "@/store/auth.store";

import { APP_PATHS } from "@/routes/paths";

interface DashboardNavItem {
  label: string;
  to: string;
}

interface DashboardNavbarProps {
  navItems?: DashboardNavItem[];
  leadingAction?: ReactNode;
  showLogo?: boolean;
  title?: string;
  showWelcomeMessage?: boolean;
}

export default function DashboardNavbar({
  navItems = [],
  leadingAction,
  showLogo = true,
  title,
  showWelcomeMessage = true,
}: DashboardNavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, handleLogout } = useLogout();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const profilePath =
    user?.role === "TEACHER"
      ? APP_PATHS.teacher.profile
      : user?.role === "STUDENT"
        ? APP_PATHS.student.profile
        : user?.role === "ADMIN"
          ? APP_PATHS.admin.profile
          : undefined;

  return (
    <>
      <header
        className="
                    sticky
                    top-0
                    z-[100]
                    isolate
                    border-b
                    border-blue-900/10
                    bg-[var(--color-app-background)]
                    backdrop-blur
                "
      >
        <Container>
          <div
            className="
                            flex
                            h-16
                            items-center
                            justify-between
                            gap-6
                        "
          >
            <div className="flex min-w-0 items-center gap-4">
              {leadingAction ? (
                <div className="shrink-0">{leadingAction}</div>
              ) : null}

              {showLogo ? <LogoLink /> : null}

              {showLogo && showWelcomeMessage ? (
                <div className="hidden h-8 w-px bg-[var(--color-border-soft)] sm:block" />
              ) : null}

              {title ? (
                <Heading as="h6" className="truncate text-blue-700">
                  {title}
                </Heading>
              ) : null}

              {!title && showWelcomeMessage ? (
                <UserWelcomeMessage
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                />
              ) : null}
            </div>

            {navItems.length > 0 ? (
              <nav
                className="
                                    hidden
                                    items-center
                                    gap-8
                                    md:flex
                                "
              >
                {navItems.map((item) => (
                  <RouterNavItem
                    key={item.to}
                    label={item.label}
                    to={item.to}
                  />
                ))}
              </nav>
            ) : null}

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

              <NotificationsMenu />

              <div className="h-8 w-px bg-[var(--color-border-soft)]" />

              <ProfileDropdown
                firstName={user?.firstName}
                lastName={user?.lastName}
                role={user?.role}
                imageUrl={user?.avatarUrl ?? undefined}
                profilePath={profilePath}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </Container>
      </header>

      <HelpDialog
        isOpen={isHelpOpen}
        role={user?.role}
        onClose={() => {
          setIsHelpOpen(false);
        }}
      />
    </>
  );
}
