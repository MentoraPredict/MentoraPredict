import Container from "@/components/atoms/Container";
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
    users,
    isLoading,
    error,
    clearSearch,
    toggleStatus,
    toggleTeacherRole,
  } = useAdminUsers();
  const {
    currentPage,
    paginatedItems: paginatedUsers,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(users, USERS_PER_PAGE, search);

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6">
          <Heading as="h3" className="text-gray-900">
            Gestión de usuarios
          </Heading>

          <Text variant="small" className="mt-2 max-w-2xl">
            Visualiza usuarios registrados, administra su estado de cuenta y
            asigna o remueve el rol de docente.
          </Text>
        </div>

        <div
          className="
                        rounded-t-2xl
                        border
                        border-gray-200
                        bg-white
                        p-5
                    "
        >
          <Text
            variant="caption"
            className="
                            mb-3
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-gray-600
                        "
          >
            Buscar usuarios
          </Text>

          <SearchBar
            value={search}
            placeholder="Buscar por nombres, apellidos o correo"
            onChange={setSearch}
            onClear={clearSearch}
            onSearch={() => {}}
          />
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
            onToggleStatus={toggleStatus}
            onToggleTeacherRole={toggleTeacherRole}
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
