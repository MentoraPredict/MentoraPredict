import { ButtonHTMLAttributes } from "react";

type Variant =
    | "primary"
    | "secondary"
    | "outline";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

export default function Button({
    children,
    variant = "primary",
    className = "",
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
            className={`
        inline-flex
        items-center
        justify-center
        rounded-xl
        px-6
        py-3
        font-medium
        transition
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}