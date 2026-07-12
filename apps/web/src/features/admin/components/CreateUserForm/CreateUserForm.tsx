import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";
import { FormField, PasswordField } from "@/components/molecules";
import { USER_ROLES, type UserRole } from "@/types/user/role.types";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

interface CreateUserFormProps {
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onCreateUser: (payload: CreateUserPayload, avatarFile?: File) => void;
}

export default function CreateUserForm({
  isSubmitting = false,
  errorMessage,
  onCancel,
  onCreateUser,
}: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(
    undefined
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarChange = (file: File) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Solo se aceptan imagenes jpg, jpeg o png.");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("La imagen no debe superar los 2MB.");
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = (values: CreateUserFormValues) => {
    onCreateUser(values, avatarFile ?? undefined);
    reset();
    setAvatarFile(null);
    setAvatarPreviewUrl(undefined);
    setAvatarError(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Heading as="h4" className="border-b border-gray-200 pb-4 text-gray-900">
        Crear usuario
      </Heading>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            id="firstName"
            label="Nombres"
            placeholder="Ingresa los nombres"
            error={errors.firstName?.message}
            {...register("firstName", { required: "Los nombres son obligatorios" })}
          />

          <FormField
            id="lastName"
            label="Apellidos"
            placeholder="Ingresa los apellidos"
            error={errors.lastName?.message}
            {...register("lastName", { required: "Los apellidos son obligatorios" })}
          />
        </div>

        <FormField
          id="email"
          label="Correo institucional"
          type="email"
          placeholder="ejemplo@institucion.edu.ec"
          error={errors.email?.message}
          {...register("email", { required: "El correo es obligatorio" })}
        />

        <PasswordField
          id="password"
          label="Contraseña inicial"
          placeholder="********"
          error={errors.password?.message}
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: { value: 8, message: "Debe tener mínimo 8 caracteres" },
          })}
        />

        <div>
          <Label htmlFor="role">Rol</Label>

          <Select id="role" hasError={!!errors.role} {...register("role", { required: true })}>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </Select>

          <p className="mt-1 text-xs text-gray-500">
            El usuario se crea con esta contraseña inicial; comunícasela directamente, no existe
            invitación por correo.
          </p>
        </div>

        <div>
          <Label>Foto de perfil (opcional)</Label>

          <div className="mt-2">
            <ImageUploadPreview
              imageUrl={avatarPreviewUrl}
              alt="Foto de perfil"
              helperText={avatarFile ? "Cambiar foto" : "Subir foto de perfil"}
              onChangeImage={handleAvatarChange}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            jpg, jpeg o png, maximo 2MB.
          </p>

          {avatarError ? (
            <p className="mt-1 text-sm text-red-600">{avatarError}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
