import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", hasError = false, children, ...props }, ref) => {
    return (
      <select
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

                    ${
                      hasError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-700"
                    }

                    ${className}
                `}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";

export default Select;
