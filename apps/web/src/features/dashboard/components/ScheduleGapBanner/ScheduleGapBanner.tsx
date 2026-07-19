import { FiAlertCircle } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface ScheduleGapBannerProps {
  coursesWithoutSchedule: number;
}

/**
 * CTA operativo (docs/frontend/dashboard-kpi-proposal.md §4): el endpoint
 * real para definir horario ya existe (Fase B, POST /subjects/:id/schedule)
 * pero todavía no hay pantalla en apps/web para llamarlo — por eso, igual
 * que SurveyStatusCard, esto es informativo y no navega a ningún lado.
 */
export default function ScheduleGapBanner({
  coursesWithoutSchedule,
}: ScheduleGapBannerProps) {
  if (coursesWithoutSchedule <= 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
            <FiAlertCircle size={20} />
          </div>
          <div>
            <Heading as="h4" className="text-amber-900">
              {coursesWithoutSchedule} materia(s) sin horario definido
            </Heading>
            <Text variant="small" className="mt-1 text-amber-800">
              Sin horario, la asistencia de esas materias sigue siendo 100%
              autorreporte del estudiante — definir el horario habilita el
              registro directo por sesión.
            </Text>
          </div>
        </div>
        <Badge tone="neutral">Próximamente en la app</Badge>
      </div>
    </div>
  );
}
