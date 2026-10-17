import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";
import ListToolbar from "@/components/molecules/ListToolbar";
import Pagination from "@/components/molecules/Pagination";

import AdminUserRestrictionDialog from "@/features/admin/components/AdminUserRestrictionDialog";
import AdminUsersTable from "@/features/admin/components/AdminUsersTable";
import CreateUserForm from "@/features/admin/components/CreateUserForm";
import useAdminUsers from "@/features/admin/hooks/useAdminUsers";
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_LABELS,
} from "@/features/admin/utils/userRoles";
import { getAdminUserEditPath } from "@/routes/paths";
import type {
  UserStatus,
  UsersGroupBy,
} from "@/services/users/users.service";
import type { UserRole } from "@/types/user/role.types";

export default function AdminUsersManagement() {
  const navigate = useNavigate();
  const {
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
    pageSize,
    totalUsers,
    totalPages,
    groups,
    expandedGroups,
    groupUsers,
    toggleGroup,
    setCurrentPage,
    mutationError,
    clearMutationError,
    toggleStatus,
    createUser,
    isCreatingUser,
    createUserError,
    clearCreateUserError,
  } = useAdminUsers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    clearCreateUserError();
  };

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="bg-blue-100 text-blue-700">Administración</Badge>
            <Heading as="h3" className="mt-3 text-gray-900">
              Gestión de usuarios
            </Heading>

            <Text variant="small" className="mt-2 max-w-2xl">
              Todas las cuentas en una sola tabla. Busca, filtra o agrupa por
              rol y estado, y abre «Editar» para configurar cada usuario.
            </Text>
          </div>

          <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
            Crear usuario
          </Button>
        </div>

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <ListToolbar
            search={search}
            searchPlaceholder="Buscar por nombres, apellidos o correo"
            searchLabel="Buscar usuarios"
            onSearchChange={setSearch}
            onClear={clearFilters}
            filters={[
              {
                id: "role",
                label: "Rol",
                value: roleFilter,
                allLabel: "Todos los roles",
                options: USER_ROLE_OPTIONS,
                onChange: (value) => setRoleFilter(value as UserRole | ""),
              },
              {
                id: "status",
                label: "Estado",
                value: statusFilter,
                allLabel: "Todos los estados",
                options: [
                  { value: "ACTIVE", label: USER_STATUS_LABELS.ACTIVE },
                  { value: "INACTIVE", label: USER_STATUS_LABELS.INACTIVE },
                ],
                onChange: (value) => setStatusFilter(value as UserStatus | ""),
              },
            ]}
            group={{
              value: groupBy,
              options: [
                { value: "role", label: "Rol" },
                { value: "status", label: "Estado" },
              ],
              onChange: (value) => setGroupBy(value as UsersGroupBy | ""),
            }}
          />
        </div>
        {!isLoading && !error && !groupBy ? (
          <div className="mb-4">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalUsers}
              totalPages={totalPages}
              itemLabel="usuarios"
              onPageChange={setCurrentPage}
            />
          </div>
        ) : null}

        {!isLoading && !error && groupBy ? (
          <Text variant="small" className="mb-4 text-gray-600">
            {totalUsers} {totalUsers === 1 ? "usuario" : "usuarios"} en{" "}
            {groups.length} {groups.length === 1 ? "grupo" : "grupos"}. Abre un
            grupo para ver sus usuarios.
          </Text>
        ) : null}

        {error ? (          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Text variant="small" className="font-medium text-red-700">
              {error}
            </Text>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <Text variant="small">Cargando...</Text>
          </div>
        ) : (
          <AdminUsersTable
            users={users}
            groupBy={groupBy}
            groups={groups}
            expandedGroups={expandedGroups}
            groupUsers={groupUsers}
            onToggleGroup={(key) => void toggleGroup(key)}
            onEditUser={(userId) => navigate(getAdminUserEditPath(userId))}
            onToggleStatus={(userId) => void toggleStatus(userId)}
          />
        )}

      </Container>

      <Modal
        isOpen={isCreateModalOpen}
        ariaLabel="Crear usuario"
        onClose={closeCreateModal}
      >
        <CreateUserForm
          isSubmitting={isCreatingUser}
          errorMessage={createUserError}
          onCancel={closeCreateModal}
          onCreateUser={(payload, avatarFile) => {
            void createUser(payload, avatarFile).then((success) => {
              if (success) {
                setIsCreateModalOpen(false);
              }
            });
          }}
        />
      </Modal>

      <AdminUserRestrictionDialog
        message={mutationError}
        onClose={clearMutationError}
      />
    </section>
  );
}
