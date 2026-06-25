import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    className?: string;
}

export default function Badge({
    children,
    className = "",
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex
        items-center
        rounded-full
        bg-blue-100
        px-3
        py-1
        text-xs
        font-semibold
        text-blue-700
        ${className}
      `}
        >
            {children}
        </span>
    );
}
