import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button, Heading, Text } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { APP_PATHS } from "@/routes/paths";
import { forgotPassword } from "@/services/auth.service";

interface ForgotPasswordFormData {
  correo: string;
}

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [developmentToken, setDevelopmentToken] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(undefined);
    setSuccessMessage(undefined);
    setDevelopmentToken(undefined);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email: data.correo });

      setSuccessMessage(
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      );
      setDevelopmentToken(response.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setServerError(
          Array.isArray(message)
            ? message.join(". ")
            : (message ?? "No se pudo enviar la solicitud de recuperación"),
        );
      } else {
        setServerError("No se pudo enviar la solicitud de recuperación");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-md">
        <Heading as="h2">Recuperar contraseña</Heading>

        <Text className="mt-2">
          Ingresa tu correo institucional y te enviaremos las instrucciones para
          restablecer tu contraseña.
        </Text>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar enlace"}
          </Button>

          {serverError ? (
            <Text className="text-sm text-red-500">{serverError}</Text>
          ) : null}

          {successMessage ? (
            <Text className="text-sm text-green-700">{successMessage}</Text>
          ) : null}

          {developmentToken ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                navigate(
                  `${APP_PATHS.public.resetPassword}?token=${encodeURIComponent(developmentToken)}`,
                )
              }
            >
              Continuar con token de desarrollo
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate(APP_PATHS.public.login)}
          >
            Volver al login
          </Button>
        </form>
      </div>
    </div>
  );
}
