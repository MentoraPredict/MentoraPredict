import { useState } from "react";

import Container from "@/components/atoms/Container";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Pagination from "@/components/molecules/Pagination";
import SearchBar from "@/components/molecules/SearchBar";

import AdminUsersTable from "@/features/admin/components/AdminUsersTable";
import useAdminUsers from "@/features/admin/hooks/useAdminUsers";
import usePagination from "@/hooks/usePagination";

const USERS_PER_PAGE = 10;

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
    isLoading,
    error,
    clearSearch,
    clearFilters,
    toggleStatus,
    toggleTeacherRole,
    saveUserProfile,
  } = useAdminUsers();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    currentPage,
    paginatedItems: paginatedUsers,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(
    users,
    USERS_PER_PAGE,
    `${search}-${roleFilter}-${facultyFilter}-${careerFilter}`
  );

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6">
          <Heading as="h3" className="text-gray-900">
            Gestión de usuarios
          </Heading>

          <Text variant="small" className="mt-2 max-w-2xl">
            Visualiza usuarios registrados, administra su estado de cuenta,
            edita sus datos principales y filtra por contexto académico.
          </Text>
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
            users={paginatedUsers}
            isFiltersOpen={isFiltersOpen}
            onToggleStatus={toggleStatus}
            onToggleTeacherRole={toggleTeacherRole}
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
            pageSize={USERS_PER_PAGE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="usuarios"
            onPageChange={setCurrentPage}
          />
        ) : null}
      </Container>
    </section>
  );
}
