import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button, Heading, Text } from "@/components/atoms";

import { FormField, PasswordField } from "@/components/molecules";

interface RegisterFormData {
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = (data: RegisterFormData) => {
    console.log(data);
  };

  return (
    <div
      className="
                flex
                items-center
                justify-center
                px-8
                py-12
            "
    >
      <div
        className="
                    w-full
                    max-w-md
                "
      >
        <Heading as="h2">Crear cuenta</Heading>

        <Text className="mt-2">
          Completa tus datos para registrarte en MentoraPredict.
        </Text>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
                        mt-8
                        space-y-4
                    "
        >
          <FormField
            id="nombres"
            label="Nombres"
            placeholder="Ingresa tus nombres"
            error={errors.nombres?.message}
            {...register("nombres", {
              required: "Los nombres son obligatorios",
            })}
          />

          <FormField
            id="apellidos"
            label="Apellidos"
            placeholder="Ingresa tus apellidos"
            error={errors.apellidos?.message}
            {...register("apellidos", {
              required: "Los apellidos son obligatorios",
            })}
          />

          <FormField
            id="correo"
            label="Correo institucional"
            type="email"
            placeholder="ejemplo@institucion.edu.ec"
            error={errors.correo?.message}
            {...register("correo", {
              required: "El correo es obligatorio",
            })}
          />

          <PasswordField
            id="password"
            label="Contraseña"
            placeholder="********"
            error={errors.password?.message}
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "Debe tener mínimo 8 caracteres",
              },
            })}
          />

          <PasswordField
            id="confirmPassword"
            label="Confirmar contraseña"
            placeholder="********"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Confirma tu contraseña",
              validate: (value) =>
                value === password || "Las contraseñas no coinciden",
            })}
          />

          <Button type="submit" className="w-full">
            Registrarse
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Ya tengo cuenta
          </Button>
        </form>
      </div>
    </div>
  );
}
