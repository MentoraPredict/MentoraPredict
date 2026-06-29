import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-gray-100"
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

        <motion.span
          className="inline-flex text-gray-500"
          animate={{ rotate: isOpen && !shouldReduceMotion ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <FiChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="menu"
            aria-label="Opciones del perfil"
            className="absolute right-0 top-14 z-[110] w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
          >
            {profilePath ? (
              <Button
                role="menuitem"
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
              role="menuitem"
              type="button"
              variant="outline"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="w-full gap-2 px-4 py-2 text-sm"
            >
              <FiLogOut />
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
