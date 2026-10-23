import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/utils/apiError";
import {
  createUserWithRole,
  getUsers,
  PartialUserCreationError,
  uploadUserAvatar,
  type CreateUserWithRolePayload,
  type UserStatus,
  type UsersGroupBy,
  type UsersGroupCount,
} from "@/services/users/users.service";
import type { AppUser } from "@/types/user/user.types";
import type { UserRole } from "@/types/user/role.types";

const USERS_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
// Un grupo abierto trae sus usuarios de una vez (tope del servicio).
const GROUP_USERS_LIMIT = 100;

export default function useAdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [groupBy, setGroupBy] = useState<UsersGroupBy | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [groups, setGroups] = useState<UsersGroupCount[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [groupUsers, setGroupUsers] = useState<Record<string, AppUser[]>>({});
  const expandedRef = useRef<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // La búsqueda consulta al servicio de autenticación: se espera a que la
  // persona termine de escribir antes de pedir resultados.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  // Cualquier cambio de criterio vuelve a la primera página y cierra los grupos.
  useEffect(() => {
    setCurrentPage(1);
    expandedRef.current = [];
    setExpandedGroups([]);
    setGroupUsers({});
  }, [debouncedSearch, roleFilter, statusFilter, groupBy]);

  // Usuarios de un grupo: el filtro del campo agrupado pasa a ser el del grupo.
  const fetchGroupUsers = useCallback(
    async (key: string) => {
      const result = await getUsers({
        page: 1,
        limit: GROUP_USERS_LIMIT,
        search: debouncedSearch,
        role: groupBy === "role" ? (key as UserRole) : roleFilter,
        status: groupBy === "status" ? (key as UserStatus) : statusFilter || undefined,
      });
      setGroupUsers((current) => ({ ...current, [key]: result.data }));
    },
    [debouncedSearch, groupBy, roleFilter, statusFilter],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Agrupado: solo se piden los conteos; los usuarios de cada grupo se
      // cargan al abrirlo (como en Odoo).
      const result = await getUsers({
        page: groupBy ? 1 : currentPage,
        limit: groupBy ? 1 : USERS_PAGE_SIZE,
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter || undefined,
        groupBy: groupBy || undefined,
      });
      setUsers(groupBy ? [] : result.data);
      setGroups(result.groups ?? []);
      setTotalUsers(result.total);
      setTotalPages(result.totalPages);

      if (groupBy) {
        await Promise.all(expandedRef.current.map(fetchGroupUsers));
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "No se pudieron cargar los usuarios. Intenta nuevamente.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    roleFilter,
    statusFilter,
    groupBy,
    fetchGroupUsers,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleGroup = useCallback(
    async (key: string) => {
      if (expandedRef.current.includes(key)) {
        expandedRef.current = expandedRef.current.filter((k) => k !== key);
        setExpandedGroups(expandedRef.current);
        return;
      }

      expandedRef.current = [...expandedRef.current, key];
      setExpandedGroups(expandedRef.current);

      try {
        await fetchGroupUsers(key);
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError,
            "No se pudieron cargar los usuarios del grupo.",
          ),
        );
      }
    },
    [fetchGroupUsers],
  );
  const clearFilters = useCallback(() => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setGroupBy("");
  }, []);

  const clearMutationError = useCallback(() => setMutationError(null), []);
  const clearCreateUserError = useCallback(() => setCreateUserError(null), []);

  const createUser = useCallback(
    async (payload: CreateUserWithRolePayload, avatarFile?: File) => {
      setCreateUserError(null);
      setIsCreatingUser(true);

      try {
        const created = await createUserWithRole(payload);
        if (avatarFile) {
          await uploadUserAvatar(created.id, avatarFile).catch(() => null);
        }
        await load();
        return true;
      } catch (requestError) {
        if (requestError instanceof PartialUserCreationError) {
          // El usuario sí se creó (como estudiante): se refresca la tabla y se
          // deja el aviso para que el rol se corrija desde su vista de edición.
          await load();
          setCreateUserError(requestError.message);
          return false;
        }

        setCreateUserError(
          getApiErrorMessage(requestError, "No se pudo crear el usuario."),
        );
        return false;
      } finally {
        setIsCreatingUser(false);
      }
    },
    [load],
  );

  return {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    groupBy,
    setGroupBy,
    clearFilters,
    users,
    isLoading,
    error,
    currentPage,
    pageSize: USERS_PAGE_SIZE,
    totalUsers,
    totalPages,
    groups,
    expandedGroups,
    groupUsers,
    toggleGroup,
    setCurrentPage,
    mutationError,
    clearMutationError,
    createUser,
    isCreatingUser,
    createUserError,
    clearCreateUserError,
  };
}
