import Text from "@/components/atoms/Text";
import AdminUsersTableRow from "@/features/admin/components/AdminUsersTableRow";
import type { AppUser } from "@/types/user/user.types";

interface FilterOptions {
  faculties: string[];
  careers: string[];
}

interface AdminUsersTableProps {
  users: AppUser[];
  isFiltersOpen: boolean;
  roleFilter: string;
  facultyFilter: string;
  careerFilter: string;
  filterOptions: FilterOptions;
  onRoleFilterChange: (value: string) => void;
  onFacultyFilterChange: (value: string) => void;
  onCareerFilterChange: (value: string) => void;
  onClearFilters: () => void;
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

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <Text variant="caption" className="mb-2 font-semibold text-gray-600">
        {label}
      </Text>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          py-3
          text-sm
          text-gray-700
          shadow-sm
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100
        "
      >
        {children}
      </select>
    </label>
  );
}

export default function AdminUsersTable({
  users,
  isFiltersOpen,
  roleFilter,
  facultyFilter,
  careerFilter,
  filterOptions,
  onRoleFilterChange,
  onFacultyFilterChange,
  onCareerFilterChange,
  onClearFilters,
  onToggleStatus,
  onToggleTeacherRole,
  onSaveUserProfile,
}: AdminUsersTableProps) {
  return (
    <div className="overflow-hidden rounded-b-2xl border-x border-b border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse">
          <thead>
            <tr>
              <th
                colSpan={9}
                className="border-b border-gray-200 bg-gray-50 px-6 py-4"
              >
                {isFiltersOpen ? (
                  <div className="grid gap-4 lg:grid-cols-4">
                    <FilterSelect
                      label="Rol"
                      value={roleFilter}
                      onChange={onRoleFilterChange}
                    >
                      <option value="">Todos los roles</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="STUDENT">STUDENT</option>
                    </FilterSelect>

                    <FilterSelect
                      label="Facultad"
                      value={facultyFilter}
                      onChange={onFacultyFilterChange}
                    >
                      <option value="">Todas las facultades</option>
                      {filterOptions.faculties.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </FilterSelect>

                    <FilterSelect
                      label="Carrera"
                      value={careerFilter}
                      onChange={onCareerFilterChange}
                    >
                      <option value="">Todas las carreras</option>
                      {filterOptions.careers.map((career) => (
                        <option key={career} value={career}>
                          {career}
                        </option>
                      ))}
                    </FilterSelect>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="
                          inline-flex
                          w-full
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-blue-200
                          bg-blue-50
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          text-blue-700
                          transition
                          hover:bg-blue-100
                        "
                      >
                        Reiniciar filtros
                      </button>
                    </div>
                  </div>
                ) : null}
              </th>
            </tr>

            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Nombres
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Apellidos
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Correo
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Facultad
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Carrera
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Semestre
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Activo
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Rol
                </Text>
              </th>
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Acciones
                </Text>
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <AdminUsersTableRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onToggleTeacherRole={onToggleTeacherRole}
                onSaveUserProfile={onSaveUserProfile}
              />
            ))}

            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <Text variant="small">No se encontraron usuarios.</Text>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
