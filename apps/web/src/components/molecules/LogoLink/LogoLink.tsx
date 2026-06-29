import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Logo from "@/components/atoms/Logo";
import { APP_PATHS } from "@/routes/paths";

interface LogoLinkProps {
  variant?: "default" | "light";
}

export default function LogoLink({ variant = "default" }: LogoLinkProps) {
  return (
    <motion.span
      className="inline-flex"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <Link to={APP_PATHS.public.landing} aria-label="Ir a la página de inicio">
        <Logo variant={variant} />
      </Link>
    </motion.span>
  );
}
