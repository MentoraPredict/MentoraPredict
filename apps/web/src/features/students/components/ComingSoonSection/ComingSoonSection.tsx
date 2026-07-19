import type { IconType } from "react-icons";
import { FiTool } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface ComingSoonSectionProps {
  icon: IconType;
  title: string;
  description: string;
}

/**
 * Sección placeholder para ítems del sidebar que hoy no tienen una
 * funcionalidad real detrás (Calendario, Tareas, Materiales, Evaluaciones,
 * Mi Progreso, Notificaciones) — misma idea que SurveyStatusCard/
 * ScheduleGapBanner: navegación real, sin enlaces rotos, sin simular datos
 * que no existen.
 */
export default function ComingSoonSection({
  icon: Icon,
  title,
  description,
}: ComingSoonSectionProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={28} />
      </div>
      <div>
        <Heading as="h4" className="text-gray-900">
          {title}
        </Heading>
        <Text variant="small" className="mx-auto mt-2 max-w-md text-gray-500">
          {description}
        </Text>
      </div>
      <Badge tone="blue" className="gap-1">
        <FiTool size={12} />
        Próximamente
      </Badge>
    </div>
  );
}
