import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, Heading, Text } from "@/components/atoms";
import { PasswordField } from "@/components/molecules";
import { APP_PATHS } from "@/routes/paths";
import { resetPassword } from "@/services/auth.service";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [serverError, setServerError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError(
        "El enlace de recuperación no contiene un token válido. Solicita uno nuevo.",
      );
      return;
    }

    setServerError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    try {
      await resetPassword({ token, newPassword: data.password });
      setSuccessMessage(
        "Tu contraseña fue actualizada. Ya puedes iniciar sesión.",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setServerError(
          error.response?.status === 400
            ? "El enlace es inválido, expiró o ya fue utilizado. Solicita uno nuevo."
            : Array.isArray(message)
              ? message.join(". ")
              : (message ?? "No se pudo actualizar la contraseña"),
        );
      } else {
        setServerError("No se pudo actualizar la contraseña");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-md">
        <Heading as="h2">Crear nueva contraseña</Heading>

        <Text className="mt-2">
          Ingresa una contraseña nueva para recuperar el acceso a tu cuenta.
        </Text>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <PasswordField
            id="password"
            label="Nueva contraseña"
            placeholder="********"
            error={errors.password?.message}
            disabled={Boolean(successMessage)}
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
            label="Confirmar nueva contraseña"
            placeholder="********"
            error={errors.confirmPassword?.message}
            disabled={Boolean(successMessage)}
            {...register("confirmPassword", {
              required: "Confirma tu contraseña",
              validate: (value) =>
                value === password || "Las contraseñas no coinciden",
            })}
          />

          {!token ? (
            <Text className="text-sm text-red-500">
              Este enlace no contiene un token de recuperación.
            </Text>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !token || Boolean(successMessage)}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
          </Button>

          {serverError ? (
            <Text className="text-sm text-red-500">{serverError}</Text>
          ) : null}

          {successMessage ? (
            <Text className="text-sm text-green-700">{successMessage}</Text>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate(
                successMessage
                  ? APP_PATHS.public.login
                  : APP_PATHS.public.forgotPassword,
              )
            }
          >
            {successMessage ? "Ir al login" : "Solicitar un enlace nuevo"}
          </Button>
        </form>
      </div>
    </div>
  );
}
