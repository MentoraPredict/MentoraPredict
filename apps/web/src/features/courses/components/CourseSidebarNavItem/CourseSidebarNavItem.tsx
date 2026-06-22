import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import Text from "@/components/atoms/Text";

interface CourseSidebarNavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

export default function CourseSidebarNavItem({
  to,
  icon,
  label,
}: CourseSidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    transition
                    ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "text-blue-100 hover:bg-blue-800"
                    }
                `
      }
    >
      <span className="text-current">{icon}</span>

      <Text variant="small" className="font-medium text-current">
        {label}
      </Text>
    </NavLink>
  );
}
