import { NavLink } from "react-router-dom";

interface RouterNavItemProps {
  label: string;
  to: string;
}

export default function RouterNavItem({ label, to }: RouterNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      isActive
                        ? "text-blue-700"
                        : "text-gray-600 hover:text-blue-700"
                    }
                `
      }
    >
      {label}
    </NavLink>
  );
}
