import { useNavigate } from "react-router-dom";

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
    Button,
    Heading,
    Text,
} from "@/components/atoms";

import {
    AuthFooter,
    Divider,
    FormField,
    PasswordField,
} from "@/components/molecules";
import { login } from "@/services/auth.service";

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginForm() {
    const navigate = useNavigate();
    const [serverError, setServerError] =
        useState<string>();
    const [isSubmittingLogin, setIsSubmittingLogin] =
        useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (
        data: LoginFormData
    ) => {
        setServerError(undefined);
        setIsSubmittingLogin(true);

        try {
            await login(data);
            navigate("/");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message =
                    error.response?.data?.message;

                setServerError(
                    Array.isArray(message)
                        ? message.join(". ")
                        : message ??
                              "No se pudo iniciar sesion"
                );
                return;
            }

            setServerError(
                "No se pudo iniciar sesion"
            );
        } finally {
            setIsSubmittingLogin(false);
        }
    };

    return (
        <section
            className="
                flex
                items-center
                justify-center
                p-8
            "
        >
            <div
                className="
                    w-full
                    max-w-md
                    space-y-6
                "
            >
                <div>
                    <Heading as="h2">
                        Bienvenido
                    </Heading>

                    <Text>
                        Inicia sesión para continuar
                    </Text>
                </div>

                <form
                    onSubmit={handleSubmit(
                        onSubmit
                    )}
                    className="space-y-4"
                >
                    <FormField
                        id="email"
                        label="Correo institucional"
                        type="email"
                        placeholder="correo@universidad.edu"
                        error={
                            errors.email?.message
                        }
                        {...register(
                            "email",
                            {
                                required:
                                    "El correo es obligatorio",
                            }
                        )}
                    />

                    <PasswordField
                        id="password"
                        label="Contraseña"
                        placeholder="********"
                        error={
                            errors.password
                                ?.message
                        }
                        {...register(
                            "password",
                            {
                                required:
                                    "La contraseña es obligatoria",
                            }
                        )}
                    />

                    <div
                        className="
                            flex
                            justify-end
                        "
                    >
                        <button
                            type="button"
                            className="
                                text-sm
                                text-blue-700
                                hover:underline
                            "
                            onClick={() => {
                                navigate("/forgot-password");
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmittingLogin}
                    >
                        Iniciar sesión
                    </Button>
                    {serverError ? (
                        <Text className="text-sm text-red-500">
                            {serverError}
                        </Text>
                    ) : null}
                </form>

                <Divider />

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        navigate("/register");
                    }}
                >
                    Crear cuenta
                </Button>

                <AuthFooter />
            </div>
        </section>
    );
}
