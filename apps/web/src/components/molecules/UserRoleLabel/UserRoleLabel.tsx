import Text from "@/components/atoms/Text";
import type { UserRole } from "@/types/user/role.types";

interface UserRoleLabelProps {
  role?: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};

export default function UserRoleLabel({ role }: UserRoleLabelProps) {
  if (!role) {
    return null;
  }

  return (
    <Text variant="caption" className="font-medium text-gray-500">
      {roleLabels[role]}
    </Text>
  );
}
