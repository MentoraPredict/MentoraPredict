import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import type { Course } from "@/types/course";

import {
  insufficientDataPresentation,
  riskLevelPresentation,
} from "../../utils/riskLevelPresentation";
import type { AggregatedRiskSummary } from "../../types/dashboard-kpi.types";

interface RiskOverviewBannerProps {
  summary: AggregatedRiskSummary;
  nextCourse: Course | null;
  onViewCourse: (courseId: string) => void;
}

/**
 * Reemplaza el panel "Estado académico" anterior — antes calculaba un
 * estado ad-hoc (conteo de materias en riesgo + promedio); ahora agrega
 * directamente el riskLevel real que analytics-service ya calcula por
 * materia (docs/frontend/dashboard-kpi-proposal.md §3). Sin mock.
 */
export default function RiskOverviewBanner({
  summary,
  nextCourse,
  onViewCourse,
}: RiskOverviewBannerProps) {
  const presentation = summary.hasData
    ? riskLevelPresentation[summary.level]
    : insufficientDataPresentation;

  return (
    <>
      <Text variant="caption" className="font-bold uppercase text-gray-500">
        Tu nivel de riesgo académico
      </Text>

      <div className={`mt-4 rounded-2xl border px-5 py-4 ${presentation.panelClassName}`}>
        <Text variant="small" className="font-bold">
          {presentation.label}
        </Text>

        <Text variant="small" className="mt-2">
          {summary.reason}
        </Text>
      </div>

      {nextCourse ? (
        <button
          type="button"
          onClick={() => onViewCourse(nextCourse.id)}
          className="mt-5 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left transition hover:shadow-sm"
        >
          <Text variant="caption" className="font-bold uppercase text-gray-500">
            Materia sugerida
          </Text>
          <Heading as="h4" className="mt-1 text-gray-900">
            {nextCourse.name}
          </Heading>
        </button>
      ) : null}
    </>
  );
}
