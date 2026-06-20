import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", hasError = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
                    w-full
                    resize-none
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
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
