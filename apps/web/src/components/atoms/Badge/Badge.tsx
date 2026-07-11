import type { ReactNode } from "react";

type BadgeTone = "blue" | "green" | "violet" | "red" | "neutral";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  blue: "bg-blue-100 text-blue-700 ring-blue-200/70",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200/70",
  violet: "bg-violet-100 text-violet-700 ring-violet-200/70",
  red: "bg-red-100 text-red-700 ring-red-200/70",
  neutral: "bg-gray-100 text-gray-700 ring-gray-200/70",
};

export default function Badge({
  children,
  className = "",
  tone = "blue",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ring-1
        ring-inset
        ${toneClasses[tone]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
