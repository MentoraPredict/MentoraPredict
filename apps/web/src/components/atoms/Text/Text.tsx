import { ReactNode } from "react";

type TextVariant =
    | "body"
    | "small"
    | "caption";

interface TextProps {
    children: ReactNode;
    variant?: TextVariant;
    className?: string;
    title?: string;
}

export default function Text({
    children,
    variant = "body",
    className = "",
    title,
}: TextProps) {
    const variants = {
        body: "text-base text-gray-600",
        small: "text-sm text-gray-600",
        caption: "text-xs text-gray-500",
    };

    return (
        <p className={`${variants[variant]} ${className}`} title={title}>
            {children}
        </p>
    );
}