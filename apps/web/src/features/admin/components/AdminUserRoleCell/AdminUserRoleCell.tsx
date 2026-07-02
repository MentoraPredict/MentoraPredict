import Badge from "@/components/atoms/Badge";
import Text from "@/components/atoms/Text";
import type { UserRole } from "@/types/user/role.types";

interface AdminUserRoleCellProps {
  role: UserRole;
  onToggleTeacherRole?: () => void;
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Admin",
};

export default function AdminUserRoleCell({
  role,
  onToggleTeacherRole,
}: AdminUserRoleCellProps) {
  if (role === "ADMIN") {
    return <Badge>{roleLabels[role]}</Badge>;
  }

  return (
    <button
      type="button"
      onClick={onToggleTeacherRole}
      className="
                group
                inline-flex
                min-w-32
                items-center
                justify-center
            "
    >
      <span className="group-hover:hidden">
        <Badge>{roleLabels[role]}</Badge>
      </span>

      <span className="hidden group-hover:block">
        <Text variant="caption" className="font-semibold text-blue-700">
          {role === "STUDENT" ? "Asignar docente" : "Quitar docente"}
        </Text>
      </span>
    </button>
  );
}
