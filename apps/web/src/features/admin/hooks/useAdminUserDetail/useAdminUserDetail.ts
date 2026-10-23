import { useCallback, useEffect, useState } from "react";

import {
  deleteUser,
  deleteUserAvatar,
  getUserById,
  updateUser,
  updateUserRole,
  uploadUserAvatar,
  type UpdateUserPayload,
} from "@/services/users/users.service";
import type { AppUser } from "@/types/user/user.types";
import type { UserRole } from "@/types/user/role.types";
import { getApiErrorMessage } from "@/utils/apiError";

export interface UserDraftChanges extends UpdateUserPayload {
  role?: UserRole;
}

export default function useAdminUserDetail(userId: string) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wasSaved, setWasSaved] = useState(false);
  // Errores de la acción en curso (guardar, eliminar). Si el backend rechaza
  // por una regla (p. ej. un docente con cursos activos) se explica la causa.
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setUser(await getUserById(userId));
    } catch (requestError) {
      setLoadError(
        getApiErrorMessage(requestError, "No se pudo cargar el usuario."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Guarda solo lo que cambió. El rol viaja aparte porque pasa por validaciones
   * propias (docente con cursos, estudiante con matrícula) y, si falla, no debe
   * deshacer el resto de los datos ya guardados.
   */
  const save = useCallback(
    async (changes: UserDraftChanges, avatarFile?: File | null) => {
      setIsSaving(true);
      setActionError(null);
      setWasSaved(false);

      try {
        const { role, ...profileChanges } = changes;

        if (Object.keys(profileChanges).length > 0) {
          await updateUser(userId, profileChanges);
        }
        if (avatarFile) {
          await uploadUserAvatar(userId, avatarFile);
        }
        if (role) {
          await updateUserRole(userId, role);
        }

        await load();
        setWasSaved(true);
        return true;
      } catch (requestError) {
        setActionError(
          getApiErrorMessage(
            requestError,
            "No se pudieron guardar los cambios del usuario.",
          ),
        );
        // Se recarga para mostrar lo que sí quedó guardado.
        await load();
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, load],
  );

  const removeAvatar = useCallback(async () => {
    setActionError(null);
    try {
      await deleteUserAvatar(userId);
      await load();
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "No se pudo eliminar la foto."),
      );
    }
  }, [userId, load]);

  const remove = useCallback(async () => {
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteUser(userId);
      return true;
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, "No se pudo eliminar el usuario."),
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [userId]);

  const clearActionError = useCallback(() => setActionError(null), []);

  return {
    user,
    isLoading,
    loadError,
    isSaving,
    isDeleting,
    wasSaved,
    actionError,
    clearActionError,
    save,
    removeAvatar,
    remove,
  };
}
