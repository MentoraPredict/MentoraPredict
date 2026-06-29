import { motion, useReducedMotion } from "framer-motion";
import { NavLink } from "react-router-dom";

interface RouterNavItemProps {
  label: string;
  to: string;
}

export default function RouterNavItem({ label, to }: RouterNavItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className="inline-flex"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
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
    </motion.span>
  );
}
