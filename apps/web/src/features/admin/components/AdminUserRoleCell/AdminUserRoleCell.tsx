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

const roleTones: Record<UserRole, "blue" | "green" | "violet"> = {
  ADMIN: "blue",
  TEACHER: "green",
  STUDENT: "violet",
};

export default function AdminUserRoleCell({
  role,
  onToggleTeacherRole,
}: AdminUserRoleCellProps) {
  return (
    <div
      className="
        flex
        min-w-32
        items-center
        justify-center
      "
    >
      {role === "ADMIN" ? (
        <Badge tone={roleTones[role]} className="min-w-24">
          {roleLabels[role]}
        </Badge>
      ) : (
        <button
          type="button"
          onClick={onToggleTeacherRole}
          className="group inline-flex min-w-32 items-center justify-center"
          aria-label={
            role === "STUDENT"
              ? "Asignar rol de docente"
              : "Quitar rol de docente"
          }
        >
          <span className="group-hover:hidden">
            <Badge tone={roleTones[role]} className="min-w-24">
              {roleLabels[role]}
            </Badge>
          </span>

          <span className="hidden group-hover:block">
            <Text variant="caption" className="font-semibold text-blue-700">
              {role === "STUDENT" ? "Asignar docente" : "Quitar docente"}
            </Text>
          </span>
        </button>
      )}
    </div>
  );
}
