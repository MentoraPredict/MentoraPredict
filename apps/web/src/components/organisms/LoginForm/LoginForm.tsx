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

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = (
        data: LoginFormData
    ) => {
        console.log(data);
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
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Iniciar sesión
                    </Button>
                </form>

                <Divider />

                <Button
                    variant="outline"
                    className="w-full"
                >
                    Crear cuenta
                </Button>

                <AuthFooter />
            </div>
        </section>
    );
}