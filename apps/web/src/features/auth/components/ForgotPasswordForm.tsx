import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button, Heading, Text } from "@/components/atoms";

import { FormField } from "@/components/molecules";

interface ForgotPasswordFormData {
  correo: string;
}

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = (data: ForgotPasswordFormData) => {
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
        <Heading as="h2">Recuperar contraseña</Heading>

        <Text className="mt-2">
          Ingresa tu correo institucional y te enviaremos las instrucciones para
          restablecer tu contraseña.
        </Text>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
                        mt-8
                        space-y-4
                    "
        >
          <FormField
            id="correo"
            label="Correo institucional"
            type="email"
            placeholder="ejemplo@institucion.edu"
            error={errors.correo?.message}
            {...register("correo", {
              required: "El correo es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Correo inválido",
              },
            })}
          />

          <Button type="submit" className="w-full">
            Enviar enlace
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Volver al login
          </Button>
        </form>
      </div>
    </div>
  );
}
