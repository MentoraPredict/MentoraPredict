import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import AdminUsersTableRow from "@/features/admin/components/AdminUsersTableRow";
import type { AppUser } from "@/types/user/user.types";

interface FilterOptions {
  faculties: string[];
  careers: string[];
}

interface AdminUsersTableProps {
  users: AppUser[];
  showAcademicColumns?: boolean;
  showRoleColumn?: boolean;
  isFiltersOpen?: boolean;
  facultyFilter?: string;
  careerFilter?: string;
  filterOptions?: FilterOptions;
  onFacultyFilterChange?: (value: string) => void;
  onCareerFilterChange?: (value: string) => void;
  onClearFilters?: () => void;
  onToggleStatus?: (userId: string) => void;
  onToggleTeacherRole?: (userId: string) => void;
  deletingUserId?: string | null;
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
    <div>
      <Label className="mb-2 block text-xs font-semibold text-gray-600">
        {label}
      </Label>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </Select>
    </div>
  );
}

export default function AdminUsersTable({
  users,
  showAcademicColumns = false,
  showRoleColumn = false,
  isFiltersOpen = false,
  facultyFilter = "",
  careerFilter = "",
  filterOptions = { faculties: [], careers: [] },
  onFacultyFilterChange,
  onCareerFilterChange,
  onClearFilters,
  onToggleStatus,
  onToggleTeacherRole,
  deletingUserId,
  onDeleteUser,
  onSaveUserProfile,
  onUploadAvatar,
  onDeleteAvatar,
}: AdminUsersTableProps) {
  const columnCount = 5 + (showAcademicColumns ? 3 : 0) + (showRoleColumn ? 1 : 0);
  const minWidthClass = showAcademicColumns
    ? "min-w-[1240px]"
    : showRoleColumn
      ? "min-w-[900px]"
      : "min-w-[780px]";

  return (
    <div className="overflow-hidden rounded-b-2xl border-x border-b border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className={`w-full table-fixed border-collapse ${minWidthClass}`}>
          <colgroup>
            <col className={showAcademicColumns ? "w-[8%]" : "w-[14%]"} />
            <col className={showAcademicColumns ? "w-[8%]" : "w-[14%]"} />
            <col className={showAcademicColumns ? "w-[20%]" : "w-[36%]"} />
            {showAcademicColumns ? (
              <>
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[6%]" />
              </>
            ) : null}
            <col className={showAcademicColumns ? "w-[10%]" : "w-[12%]"} />
            {showRoleColumn ? (
              <col className={showAcademicColumns ? "w-[12%]" : "w-[16%]"} />
            ) : null}
            <col className={showAcademicColumns ? "w-[14%]" : "w-[18%]"} />
          </colgroup>

          <thead>
            {showAcademicColumns ? (
              <tr>
                <th
                  colSpan={columnCount}
                  className="border-b border-gray-200 bg-gray-50 px-6 py-4"
                >
                  {isFiltersOpen ? (
                    <div className="grid gap-4 lg:grid-cols-3">
                      <FilterSelect
                        label="Facultad"
                        value={facultyFilter}
                        onChange={(value) => onFacultyFilterChange?.(value)}
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
                        onChange={(value) => onCareerFilterChange?.(value)}
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
            ) : null}

            <tr className="bg-gray-100 text-left">
              <th className="truncate px-4 py-4">
                <Text
                  variant="caption"
                  className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Nombres
                </Text>
              </th>
              <th className="truncate px-4 py-4">
                <Text
                  variant="caption"
                  className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Apellidos
                </Text>
              </th>
              <th className="truncate px-4 py-4">
                <Text
                  variant="caption"
                  className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Correo
                </Text>
              </th>
              {showAcademicColumns ? (
                <>
                  <th className="truncate px-4 py-4">
                    <Text
                      variant="caption"
                      className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                    >
                      Facultad
                    </Text>
                  </th>
                  <th className="truncate px-4 py-4">
                    <Text
                      variant="caption"
                      className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                    >
                      Carrera
                    </Text>
                  </th>
                  <th className="truncate px-4 py-4">
                    <Text
                      variant="caption"
                      className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                    >
                      Semestre
                    </Text>
                  </th>
                </>
              ) : null}
              <th className="truncate px-4 py-4">
                <Text
                  variant="caption"
                  className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Activo
                </Text>
              </th>
              {showRoleColumn ? (
                <th className="truncate px-4 py-4">
                  <Text
                    variant="caption"
                    className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
                  >
                    Rol
                  </Text>
                </th>
              ) : null}
              <th className="truncate px-4 py-4">
                <Text
                  variant="caption"
                  className="truncate font-bold uppercase tracking-[0.14em] text-gray-600"
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
                showAcademicColumns={showAcademicColumns}
                showRoleColumn={showRoleColumn}
                onToggleStatus={onToggleStatus}
                onToggleTeacherRole={onToggleTeacherRole}
                isDeleting={deletingUserId === user.id}
                onDeleteUser={onDeleteUser}
                onSaveUserProfile={onSaveUserProfile}
                onUploadAvatar={onUploadAvatar}
                onDeleteAvatar={onDeleteAvatar}
              />
            ))}

            {users.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-6 py-12 text-center">
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
