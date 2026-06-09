import { ButtonHTMLAttributes } from "react";

interface IconButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> { }

export default function IconButton({
    children,
    className = "",
    type = "button",
    ...props
}: IconButtonProps) {
    return (
        <button
            type={type}
            className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        p-2
        transition
        hover:bg-gray-100
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}