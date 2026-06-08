import {
    InputHTMLAttributes,
    useState,
} from "react";

import {
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

import {
    Input,
    Label,
    ErrorMessage,
    IconButton,
} from "@/components/atoms";

interface PasswordFieldProps
    extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    error?: string;
}

export default function PasswordField({
    id,
    label,
    error,
    ...props
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] =
        useState(false);

    return (
        <div className="w-full">
            <Label htmlFor={id}>
                {label}
            </Label>

            <div className="relative">
                <Input
                    id={id}
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    hasError={!!error}
                    className="pr-12"
                    {...props}
                />

                <IconButton
                    type="button"
                    aria-label={
                        showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                    }
                    onClick={() =>
                        setShowPassword(
                            !showPassword
                        )
                    }
                    className="
                        absolute
                        right-2
                        top-1/2
                        -translate-y-1/2
                    "
                >
                    {showPassword ? (
                        <FiEyeOff />
                    ) : (
                        <FiEye />
                    )}
                </IconButton>
            </div>

            <ErrorMessage
                message={error}
            />
        </div>
    );
}