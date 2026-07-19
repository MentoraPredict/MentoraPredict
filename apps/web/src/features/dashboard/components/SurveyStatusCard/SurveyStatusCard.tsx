import { FiClipboard } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { SurveyStatus } from "../../types/dashboard-kpi.types";

interface SurveyStatusCardProps {
  status: SurveyStatus | null;
  isLoading: boolean;
  onOpenSurvey: () => void;
}

/**
 * El backend de la encuesta socioeconómica ya existe (Fase D,
 * docs/database/database-update-plan.md) y ahora también la pantalla en
 * apps/web (/student/survey) — este botón navega ahí en vez de mostrar un
 * badge "próximamente".
 */
export default function SurveyStatusCard({
  status,
  isLoading,
  onOpenSurvey,
}: SurveyStatusCardProps) {
  if (isLoading || !status) {
    return null;
  }

  if (status.hasResponded && !status.isStale) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white">
            <FiClipboard size={20} />
          </div>
          <div>
            <Heading as="h4" className="text-violet-900">
              Encuesta socioeconómica pendiente
            </Heading>
            <Text variant="small" className="mt-1 text-violet-800">
              Ayuda a MentoraPredict a entender mejor tu situación — mientras
              más información tengamos, más precisas serán las
              recomendaciones.
            </Text>
          </div>
        </div>
        <Button
          type="button"
          onClick={onOpenSurvey}
          className="bg-violet-700 px-5 py-2 text-sm hover:bg-violet-800"
        >
          Responder
        </Button>
      </div>
    </div>
  );
}
