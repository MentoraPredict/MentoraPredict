import Text from "@/components/atoms/Text";
import AdminUsersTableRow from "@/features/admin/components/AdminUsersTableRow";
import type { AppUser } from "@/types/user/user.types";

interface AdminUsersTableProps {
  users: AppUser[];
  onToggleStatus?: (userId: string) => void;
  onToggleTeacherRole?: (userId: string) => void;
}

export default function AdminUsersTable({
  users,
  onToggleStatus,
  onToggleTeacherRole,
}: AdminUsersTableProps) {
  return (
    <div
      className="
                overflow-hidden
                rounded-b-2xl
                border-x
                border-b
                border-gray-200
                bg-white
            "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse">
          <thead>
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
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <AdminUsersTableRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onToggleTeacherRole={onToggleTeacherRole}
              />
            ))}

            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
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
