import { LabelHTMLAttributes } from "react";

interface LabelProps
    extends LabelHTMLAttributes<HTMLLabelElement> { }

export default function Label({
    children,
    className = "",
    ...props
}: LabelProps) {
    return (
        <label
            className={`
        mb-2
        block
        text-sm
        font-medium
        text-gray-700
        ${className}
      `}
            {...props}
        >
            {children}
        </label>
    );
}