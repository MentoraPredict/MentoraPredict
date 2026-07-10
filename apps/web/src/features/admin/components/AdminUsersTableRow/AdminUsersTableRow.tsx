import { useEffect, useMemo, useState } from "react";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";
import AdminUserRoleCell from "@/features/admin/components/AdminUserRoleCell";
import AdminUserStatusCell from "@/features/admin/components/AdminUserStatusCell";
import type { AppUser } from "@/types/user/user.types";

interface AdminUsersTableRowProps {
  user: AppUser;
  onToggleStatus?: (userId: string) => void;
  onToggleTeacherRole?: (userId: string) => void;
  onSaveUserProfile?: (
    userId: string,
    payload: {
      email?: string;
      firstName?: string;
      lastName?: string;
    }
  ) => Promise<AppUser>;
}

export default function AdminUsersTableRow({
  user,
  onToggleStatus,
  onToggleTeacherRole,
  onSaveUserProfile,
}: AdminUsersTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftFirstName, setDraftFirstName] = useState(user.firstName ?? "");
  const [draftLastName, setDraftLastName] = useState(user.lastName ?? "");
  const [draftEmail, setDraftEmail] = useState(
    user.email === "Sin correo registrado" ? "" : user.email ?? ""
  );

  useEffect(() => {
    setDraftFirstName(user.firstName ?? "");
    setDraftLastName(user.lastName ?? "");
    setDraftEmail(user.email === "Sin correo registrado" ? "" : user.email ?? "");
  }, [user]);

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
      setIsEditing(false);
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
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
        <td className="px-6 py-4">
          <Text variant="small" className="font-medium text-gray-900">
            {user.firstName ?? "-"}
          </Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small">{user.lastName ?? "-"}</Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small">{user.email}</Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small" className="max-w-36 truncate">
            {user.facultyName ?? "Sin datos"}
          </Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small" className="max-w-40 truncate">
            {user.careerName ?? "Sin datos"}
          </Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small">{user.semester ?? "Sin datos"}</Text>
        </td>

        <td className="px-6 py-4">
          <AdminUserStatusCell
            isActive={user.isActive}
            onToggleStatus={() => {
              onToggleStatus?.(user.id);
            }}
          />
        </td>

        <td className="px-6 py-4">
          <AdminUserRoleCell
            role={user.role}
            onToggleTeacherRole={() => {
              onToggleTeacherRole?.(user.id);
            }}
          />
        </td>

        <td className="px-6 py-4">
          <Button
            variant="outline"
            type="button"
            className="px-4 py-2 text-sm"
            onClick={() => {
              setIsEditing((current) => !current);
            }}
          >
            {isEditing ? "Cerrar" : "Editar"}
          </Button>
        </td>
      </tr>

      {isEditing ? (
        <tr className="border-t border-gray-100 bg-blue-50/40">
          <td colSpan={9} className="px-6 py-5">
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

            <Text variant="caption" className="mt-4 text-gray-600">
              {academicContext}
            </Text>
          </td>
        </tr>
      ) : null}
    </>
  );
}
