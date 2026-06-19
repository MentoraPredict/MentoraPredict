import { InputHTMLAttributes } from "react";

import {
    Input,
    Label,
    ErrorMessage,
} from "@/components/atoms";

interface FormFieldProps
    extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    error?: string;
}

export default function FormField({
    id,
    label,
    error,
    ...props
}: FormFieldProps) {
    return (
        <div className="w-full">
            <Label htmlFor={id}>
                {label}
            </Label>

            <Input
                id={id}
                hasError={!!error}
                {...props}
            />

            <ErrorMessage
                message={error}
            />
        </div>
    );
}