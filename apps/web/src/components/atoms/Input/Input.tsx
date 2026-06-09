import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", hasError = false, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`
          w-full
          rounded-xl
          border
          bg-white
          px-4
          py-3
          text-sm
          text-gray-900
          outline-none
          transition

          ${hasError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-700"
                    }

          ${className}
        `}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export default Input;