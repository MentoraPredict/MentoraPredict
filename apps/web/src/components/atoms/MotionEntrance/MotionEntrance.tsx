import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

type MotionEntranceElement = "div" | "main" | "section";
type MotionEntranceVariant = "page" | "form";

interface MotionEntranceProps {
  as?: MotionEntranceElement;
  children: ReactNode;
  className?: string;
  variant?: MotionEntranceVariant;
}

const entranceVariants: Record<MotionEntranceVariant, Variants> = {
  page: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
  form: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
};

export default function MotionEntrance({
  as = "div",
  children,
  className,
  variant = "page",
}: MotionEntranceProps) {
  const animationProps = {
    initial: "hidden",
    animate: "visible",
    variants: entranceVariants[variant],
    className,
  };

  if (as === "main") {
    return <motion.main {...animationProps}>{children}</motion.main>;
  }

  if (as === "section") {
    return <motion.section {...animationProps}>{children}</motion.section>;
  }

  return <motion.div {...animationProps}>{children}</motion.div>;
}
