import { FiInfo } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";
import type { UserRole } from "@/types/user/role.types";

interface UserProfileDetailsCardProps {
  email: string;
  role: UserRole;
  timezone?: string;
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};

export default function UserProfileDetailsCard({
  email,
  role,
  timezone = "Quito/Ecuador (GMT-5)",
}: UserProfileDetailsCardProps) {
  return (
    <MotionCard
      as="section"
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
      <div className="mb-5 flex items-center gap-2">
        <FiInfo className="text-blue-700" />

        <Heading as="h5" className="text-blue-700">
          Detalles del perfil
        </Heading>
      </div>

      <div className="space-y-4">
        <div>
          <Text
            variant="caption"
            className="font-semibold uppercase tracking-[0.12em] text-gray-600"
          >
            Dirección de correo
          </Text>

          <Text variant="small" className="mt-1 font-semibold text-blue-700">
            {email}
          </Text>
        </div>

        <div>
          <Text
            variant="caption"
            className="font-semibold uppercase tracking-[0.12em] text-gray-600"
          >
            Rol
          </Text>

          <Text variant="small" className="mt-1 font-semibold text-gray-900">
            {roleLabels[role]}
          </Text>
        </div>

        <div>
          <Text
            variant="caption"
            className="font-semibold uppercase tracking-[0.12em] text-gray-600"
          >
            Zona horaria
          </Text>

          <Text variant="small" className="mt-1 font-semibold text-gray-900">
            {timezone}
          </Text>
        </div>
      </div>
    </MotionCard>
  );
}
