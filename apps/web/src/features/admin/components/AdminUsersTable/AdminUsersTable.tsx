import Text from "@/components/atoms/Text";
import AdminUsersTableRow from "@/features/admin/components/AdminUsersTableRow";
import type { AppUser } from "@/types/user/user.types";

interface AdminUsersTableProps {
  users: AppUser[];
  showRoleColumn?: boolean;
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

export default function AdminUsersTable({
  users,
  showRoleColumn = false,
  onToggleStatus,
  onToggleTeacherRole,
  deletingUserId,
  onDeleteUser,
  onSaveUserProfile,
  onUploadAvatar,
  onDeleteAvatar,
}: AdminUsersTableProps) {
  const columnCount = 5 + (showRoleColumn ? 1 : 0);
  const minWidthClass = showRoleColumn ? "min-w-[900px]" : "min-w-[780px]";

  return (
    <div className="overflow-hidden rounded-b-2xl border-x border-b border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className={`w-full table-fixed border-collapse ${minWidthClass}`}>
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[36%]" />
            <col className="w-[12%]" />
            {showRoleColumn ? <col className="w-[16%]" /> : null}
            <col className="w-[18%]" />
          </colgroup>

          <thead>
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
              <th className="truncate px-4 py-4 text-center">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Activo
                </Text>
              </th>
              {showRoleColumn ? (
                <th className="truncate px-4 py-4 text-center">
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
