import type {
  AriaRole,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
} from "react";
import { motion } from "framer-motion";

type MotionCardElement = "article" | "div" | "section";

interface MotionCardProps {
  as?: MotionCardElement;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  role?: AriaRole;
  tabIndex?: number;
}

export default function MotionCard({
  as = "div",
  children,
  className,
  onClick,
  onKeyDown,
  role,
  tabIndex,
}: MotionCardProps) {
  const motionProps = {
    className,
    onClick,
    onKeyDown,
    role,
    tabIndex,
    whileHover: { scale: 1.01, y: -4 },
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  };

  if (as === "article") {
    return <motion.article {...motionProps}>{children}</motion.article>;
  }

  if (as === "section") {
    return <motion.section {...motionProps}>{children}</motion.section>;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}
