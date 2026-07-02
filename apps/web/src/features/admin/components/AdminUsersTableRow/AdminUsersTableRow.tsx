import Text from "@/components/atoms/Text";
import AdminUserRoleCell from "@/features/admin/components/AdminUserRoleCell";
import AdminUserStatusCell from "@/features/admin/components/AdminUserStatusCell";
import type { AppUser } from "@/types/user/user.types";

interface AdminUsersTableRowProps {
  user: AppUser;
  onToggleStatus?: (userId: string) => void;
  onToggleTeacherRole?: (userId: string) => void;
}

export default function AdminUsersTableRow({
  user,
  onToggleStatus,
  onToggleTeacherRole,
}: AdminUsersTableRowProps) {
  return (
    <tr
      className="
                border-t
                border-gray-200
                transition
                hover:bg-gray-50
            "
    >
      <td className="px-6 py-4">
        <Text variant="small" className="font-medium text-gray-900">
          {user.firstName ?? "-"}
        </Text>
      </td>

      <td className="px-6 py-4">
        <Text variant="small">{user.lastName ?? "-"}</Text>
      </td>

      <td className="px-6 py-4">
        <Text variant="small">{user.email}</Text>
      </td>

      <td className="px-6 py-4">
        <AdminUserStatusCell
          isActive={user.isActive}
          onToggleStatus={() => {
            onToggleStatus?.(user.id);
          }}
        />
      </td>

      <td className="px-6 py-4">
        <AdminUserRoleCell
          role={user.role}
          onToggleTeacherRole={() => {
            onToggleTeacherRole?.(user.id);
          }}
        />
      </td>
    </tr>
  );
}
