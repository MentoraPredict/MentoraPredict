import Badge from "@/components/atoms/Badge";
import {
  USER_ROLE_LABELS,
  USER_ROLE_TONES,
} from "@/features/admin/utils/userRoles";
import type { UserRole } from "@/types/user/role.types";

interface AdminUserRoleCellProps {
  role: UserRole;
}

/** Rol del usuario. El rol se cambia desde la vista de edición del usuario. */
export default function AdminUserRoleCell({ role }: AdminUserRoleCellProps) {
  return (
    <Badge tone={USER_ROLE_TONES[role]} className="min-w-24">
      {USER_ROLE_LABELS[role]}
    </Badge>
  );
}
