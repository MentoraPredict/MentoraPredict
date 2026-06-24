import { useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import UserAvatar from "@/components/atoms/UserAvatar";
import UserRoleLabel from "@/components/molecules/UserRoleLabel";
import type { UserRole } from "@/types/user/role.types";

interface ProfileDropdownProps {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  imageUrl?: string;
  profilePath?: string;
  isLoggingOut?: boolean;
  onLogout: () => void;
}

export default function ProfileDropdown({
  firstName,
  lastName,
  role,
  imageUrl,
  profilePath,
  isLoggingOut = false,
  onLogout,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-2
                    py-1
                    transition
                    hover:bg-gray-100
                "
      >
        <div className="hidden text-right sm:block">
          <Text
            variant="small"
            className="font-semibold leading-tight text-gray-900"
          >
            {fullName || "Usuario"}
          </Text>

          <UserRoleLabel role={role} />
        </div>

        <UserAvatar
          imageUrl={imageUrl}
          firstName={firstName}
          lastName={lastName}
        />

        <FiChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen ? (
        <div
          className="
                        absolute
                        right-0
                        top-14
                        z-[110]
                        w-56
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        p-3
                        shadow-lg
          "
        >
          {profilePath ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                navigate(profilePath);
              }}
              className="mb-2 w-full gap-2 px-4 py-2 text-sm"
            >
              <FiUser />
              Ver perfil
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full gap-2 px-4 py-2 text-sm"
          >
            <FiLogOut />
            {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
