import { useMemo, useState } from "react";

import Container from "@/components/atoms/Container";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";
import Pagination from "@/components/molecules/Pagination";
import SearchBar from "@/components/molecules/SearchBar";
import StatCard from "@/components/molecules/StatCard";

import AdminUsersTable from "@/features/admin/components/AdminUsersTable";
import CreateUserForm from "@/features/admin/components/CreateUserForm";
import useAdminUsers from "@/features/admin/hooks/useAdminUsers";

export default function AdminUsersManagement() {
  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    facultyFilter,
    setFacultyFilter,
    careerFilter,
    setCareerFilter,
    filterOptions,
    users,
    allUsers,
    currentPage,
    pageSize,
    totalUsers,
    totalPages,
    setCurrentPage,
    isLoading,
    error,
    clearSearch,
    clearFilters,
    toggleStatus,
    toggleTeacherRole,
    saveUserProfile,
    createUser,
    isCreatingUser,
    createUserError,
    clearCreateUserError,
    deletingUserId,
    removeUser,
  } = useAdminUsers();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const stats = useMemo(
    () => ({
      total: totalUsers,
      active: allUsers.filter((user) => user.isActive).length,
      teachers: allUsers.filter((user) => user.role === "TEACHER").length,
      students: allUsers.filter((user) => user.role === "STUDENT").length,
    }),
    [allUsers, totalUsers]
  );

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
              Visualiza usuarios registrados, administra su estado de cuenta,
              edita sus datos principales y filtra por contexto académico.
            </Text>
          </div>

          <Button
            type="button"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            Crear usuario
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard value={String(stats.total)} label="Usuarios totales" />
          <StatCard value={String(stats.active)} label="Activos en pagina" />
          <StatCard value={String(stats.teachers)} label="Docentes en pagina" />
          <StatCard value={String(stats.students)} label="Estudiantes en pagina" />
        </div>

        <div className="rounded-t-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <Text
              variant="caption"
              className="font-semibold uppercase tracking-[0.2em] text-gray-600"
            >
              Buscar usuarios
            </Text>
            <Text variant="small" className="mt-1 text-gray-600">
              Edita nombres, apellidos y correo; el contexto académico se
              muestra cuando el usuario tiene matrículas activas.
            </Text>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={search}
                placeholder="Buscar por nombres, apellidos, correo o contexto académico"
                onChange={setSearch}
                onClear={clearSearch}
                onSearch={() => {}}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="lg:min-w-28"
              onClick={() => {
                setIsFiltersOpen((current) => !current);
              }}
            >
              Filtros
            </Button>
          </div>
        </div>

        {error ? (
          <div className="border-x border-gray-200 bg-red-50 px-6 py-4">
            <Text variant="small" className="font-medium text-red-700">
              {error}
            </Text>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-b-2xl border-x border-b border-gray-200 bg-white px-6 py-12 text-center">
            <Text variant="small">Cargando usuarios...</Text>
          </div>
        ) : (
          <AdminUsersTable
            users={users}
            isFiltersOpen={isFiltersOpen}
            onToggleStatus={toggleStatus}
            onToggleTeacherRole={toggleTeacherRole}
            deletingUserId={deletingUserId}
            onDeleteUser={removeUser}
            onSaveUserProfile={saveUserProfile}
            roleFilter={roleFilter}
            facultyFilter={facultyFilter}
            careerFilter={careerFilter}
            filterOptions={filterOptions}
            onRoleFilterChange={setRoleFilter}
            onFacultyFilterChange={setFacultyFilter}
            onCareerFilterChange={setCareerFilter}
            onClearFilters={clearFilters}
          />
        )}

        {!isLoading && !error ? (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalUsers}
            totalPages={totalPages}
            itemLabel="usuarios"
            onPageChange={setCurrentPage}
          />
        ) : null}
      </Container>

      <Modal
        isOpen={isCreateModalOpen}
        ariaLabel="Crear usuario"
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateUserError();
        }}
      >
        <CreateUserForm
          isSubmitting={isCreatingUser}
          errorMessage={createUserError}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateUserError();
          }}
          onCreateUser={(payload) => {
            void createUser(payload).then((success) => {
              if (success) {
                setIsCreateModalOpen(false);
              }
            });
          }}
        />
      </Modal>
    </section>
  );
}
