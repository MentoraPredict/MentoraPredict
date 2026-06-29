import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface NavItemProps {
  label: string;
  href: string;
}

export default function NavItem({ label, href }: NavItemProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.querySelector<HTMLElement>(href);

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", href);
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="
        text-sm
        font-medium
        text-gray-600
        transition-colors
        hover:text-blue-700
      "
    >
      {label}
    </motion.a>
  );
}
