import { useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";
import AdminUserRoleCell from "@/features/admin/components/AdminUserRoleCell";
import AdminUserStatusCell from "@/features/admin/components/AdminUserStatusCell";
import type { AppUser } from "@/types/user/user.types";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface AdminUsersTableRowProps {
  user: AppUser;
  showAcademicColumns?: boolean;
  showRoleColumn?: boolean;
  onToggleStatus?: (userId: string) => void;
  onToggleTeacherRole?: (userId: string) => void;
  isDeleting?: boolean;
  onDeleteUser?: (userId: string) => Promise<boolean>;
  onSaveUserProfile?: (
    userId: string,
    payload: {
      email?: string;
      firstName?: string;
      lastName?: string;
    }
  ) => Promise<AppUser>;
  onUploadAvatar?: (userId: string, file: File) => Promise<AppUser>;
  onDeleteAvatar?: (userId: string) => Promise<AppUser>;
}

export default function AdminUsersTableRow({
  user,
  showAcademicColumns = false,
  showRoleColumn = false,
  onToggleStatus,
  onToggleTeacherRole,
  isDeleting = false,
  onDeleteUser,
  onSaveUserProfile,
  onUploadAvatar,
  onDeleteAvatar,
}: AdminUsersTableRowProps) {
  const columnCount = 5 + (showAcademicColumns ? 3 : 0) + (showRoleColumn ? 1 : 0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [draftFirstName, setDraftFirstName] = useState(user.firstName ?? "");
  const [draftLastName, setDraftLastName] = useState(user.lastName ?? "");
  const [draftEmail, setDraftEmail] = useState(
    user.email === "Sin correo registrado" ? "" : user.email ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(
    user.avatarUrl ?? undefined
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    setDraftFirstName(user.firstName ?? "");
    setDraftLastName(user.lastName ?? "");
    setDraftEmail(user.email === "Sin correo registrado" ? "" : user.email ?? "");
    setAvatarFile(null);
    setAvatarPreviewUrl(user.avatarUrl ?? undefined);
  }, [user]);

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

  const handleRemoveAvatar = async () => {
    if (!onDeleteAvatar) {
      return;
    }

    setIsSavingAvatar(true);
    try {
      await onDeleteAvatar(user.id);
      setAvatarFile(null);
      setAvatarPreviewUrl(undefined);
    } catch {
      return;
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const academicContext = useMemo(() => {
    const parts = [user.facultyName, user.careerName, user.semester].filter(
      Boolean
    );

    return parts.length > 0 ? parts.join(" | ") : "Sin datos academicos";
  }, [user.careerName, user.facultyName, user.semester]);

  const handleSave = async () => {
    if (!onSaveUserProfile) {
      return;
    }

    setIsSaving(true);

    try {
      await onSaveUserProfile(user.id, {
        email: draftEmail.trim(),
        firstName: draftFirstName.trim(),
        lastName: draftLastName.trim(),
      });

      if (avatarFile && onUploadAvatar) {
        await onUploadAvatar(user.id, avatarFile).catch(() => null);
        setAvatarFile(null);
      }

      setIsEditing(false);
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteUser) {
      return;
    }

    const confirmed = window.confirm(
      `Eliminar usuario ${user.email}? Esta accion desactivara su perfil.`,
    );

    if (!confirmed) {
      return;
    }

    await onDeleteUser(user.id);
  };

  return (
    <>
      <tr
        className="
          border-t
          border-gray-200
          transition
          hover:bg-gray-50
        "
      >
        <td className="px-4 py-4">
          <Text
            variant="small"
            className="truncate font-medium text-gray-900"
            title={user.firstName}
          >
            {user.firstName || "-"}
          </Text>
        </td>

        <td className="px-4 py-4">
          <Text variant="small" className="truncate" title={user.lastName}>
            {user.lastName || "-"}
          </Text>
        </td>

        <td className="px-4 py-4">
          <Text variant="small" className="truncate" title={user.email}>
            {user.email}
          </Text>
        </td>

        {showAcademicColumns ? (
          <>
            <td className="px-4 py-4">
              <Text variant="small" className="truncate" title={user.facultyName}>
                {user.facultyName ?? "Sin datos"}
              </Text>
            </td>

            <td className="px-4 py-4">
              <Text variant="small" className="truncate" title={user.careerName}>
                {user.careerName ?? "Sin datos"}
              </Text>
            </td>

            <td className="px-4 py-4">
              <Text variant="small" className="truncate">
                {user.semester ?? "Sin datos"}
              </Text>
            </td>
          </>
        ) : null}

        <td className="px-4 py-4">
          <AdminUserStatusCell
            isActive={user.isActive}
            onToggleStatus={() => {
              onToggleStatus?.(user.id);
            }}
          />
        </td>

        {showRoleColumn ? (
          <td className="px-4 py-4">
            <AdminUserRoleCell
              role={user.role}
              onToggleTeacherRole={() => {
                onToggleTeacherRole?.(user.id);
              }}
            />
          </td>
        ) : null}

        <td className="px-4 py-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1 px-3 py-2 text-sm"
              onClick={() => {
                setIsEditing((current) => !current);
              }}
            >
              {isEditing ? "Cerrar" : "Editar"}
            </Button>

            {user.role !== "ADMIN" ? (
              <Button
                variant="outline"
                type="button"
                className="!border-red-200 !px-3 !py-2 !text-sm !text-red-600 hover:!bg-red-50"
                disabled={isDeleting}
                onClick={handleDelete}
                title="Eliminar usuario"
              >
                {isDeleting ? "..." : <FiTrash2 size={16} />}
              </Button>
            ) : null}
          </div>
        </td>
      </tr>

      {isEditing ? (
        <tr className="border-t border-gray-100 bg-blue-50/40">
          <td colSpan={columnCount} className="px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
              <label className="block">
                <Text variant="caption" className="mb-2 font-semibold text-gray-700">
                  Nombres
                </Text>
                <Input
                  value={draftFirstName}
                  onChange={(event) => {
                    setDraftFirstName(event.target.value);
                  }}
                  placeholder="Nombres"
                />
              </label>

              <label className="block">
                <Text variant="caption" className="mb-2 font-semibold text-gray-700">
                  Apellidos
                </Text>
                <Input
                  value={draftLastName}
                  onChange={(event) => {
                    setDraftLastName(event.target.value);
                  }}
                  placeholder="Apellidos"
                />
              </label>

              <label className="block">
                <Text variant="caption" className="mb-2 font-semibold text-gray-700">
                  Correo
                </Text>
                <Input
                  value={draftEmail}
                  onChange={(event) => {
                    setDraftEmail(event.target.value);
                  }}
                  placeholder="Correo"
                />
              </label>

              <div className="flex items-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="px-4 py-3"
                  onClick={() => {
                    setDraftFirstName(user.firstName ?? "");
                    setDraftLastName(user.lastName ?? "");
                    setDraftEmail(user.email ?? "");
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  className="px-4 py-3"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <Text variant="caption" className="mb-2 block font-semibold text-gray-700">
                Foto de perfil
              </Text>

              <ImageUploadPreview
                imageUrl={avatarPreviewUrl}
                alt={`Foto de perfil de ${user.firstName ?? user.email}`}
                helperText={avatarFile ? "Cambiar foto" : "Subir foto de perfil"}
                onChangeImage={handleAvatarChange}
              />

              <p className="mt-2 text-xs text-gray-500">
                jpg, jpeg o png, maximo 2MB.
              </p>

              {avatarError ? (
                <p className="mt-1 text-sm text-red-600">{avatarError}</p>
              ) : null}

              {user.avatarUrl && !avatarFile ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 !border-red-200 !px-4 !py-2 !text-sm !text-red-600 hover:!bg-red-50"
                  disabled={isSavingAvatar}
                  onClick={() => void handleRemoveAvatar()}
                >
                  {isSavingAvatar ? "Eliminando..." : "Eliminar foto"}
                </Button>
              ) : null}
            </div>

            {showAcademicColumns ? (
              <Text variant="caption" className="mt-4 text-gray-600">
                {academicContext}
              </Text>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}
