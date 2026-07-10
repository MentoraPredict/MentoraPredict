import { ButtonHTMLAttributes } from "react";

import Spinner from "@/components/atoms/Spinner";

type Variant =
    | "primary"
    | "secondary"
    | "outline";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    className = "",
    isLoading = false,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            "bg-blue-700 text-white hover:bg-blue-800",

        secondary:
            "bg-cyan-500 text-white hover:bg-cyan-600",

        outline:
            "border border-blue-700 text-blue-700 hover:bg-blue-50",
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-6
        py-3
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-70
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {isLoading ? <Spinner size={18} /> : null}
            {children}
        </button>
    );
}