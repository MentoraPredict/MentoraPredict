import type { StudentSubjectOverview } from "@/services/course-analytics.service";
import type { Course } from "@/types/course";
import { RISK_LEVEL_RANK } from "@/types/risk";

import type { AggregatedRiskSummary } from "../types/dashboard-kpi.types";

const REASON_BY_LEVEL: Record<AggregatedRiskSummary["level"], (subjectName: string) => string> = {
  CRITICAL: (subjectName) =>
    `${subjectName} está en riesgo crítico — necesita atención inmediata.`,
  HIGH: (subjectName) =>
    `${subjectName} muestra riesgo alto. Revisa tu avance y registra tu progreso.`,
  MEDIUM: (subjectName) =>
    `${subjectName} necesita seguimiento cercano esta semana.`,
  LOW: () => "Tus materias se mantienen en un rango estable.",
};

/**
 * Agrega el peor riskLevel real entre las materias del estudiante — no es un
 * mock: analytics-service ya calcula riskLevel por materia
 * (getStudentSubjectsOverview), esto solo toma el peor caso. Ver
 * docs/frontend/dashboard-kpi-proposal.md §3 ("Ninguno — calculable HOY").
 */
export function computeAggregatedRisk(
  overview: StudentSubjectOverview[],
  coursesById: Map<string, Course>
): AggregatedRiskSummary {
  let worstSubjectId: string | null = null;
  let worstRank = -1;
  let worstLevel: AggregatedRiskSummary["level"] = "LOW";

  for (const subject of overview) {
    if (subject.riskLevel === null) continue;
    const rank = RISK_LEVEL_RANK[subject.riskLevel];
    if (rank > worstRank) {
      worstRank = rank;
      worstLevel = subject.riskLevel;
      worstSubjectId = subject.subjectId;
    }
  }

  const hasData = worstSubjectId !== null;
  const subjectName = worstSubjectId
    ? (coursesById.get(worstSubjectId)?.name ?? "Una de tus materias")
    : "";

  return {
    level: worstLevel,
    hasData,
    worstSubjectId,
    reason: hasData
      ? REASON_BY_LEVEL[worstLevel](subjectName)
      : "Aún no hay suficiente información semanal para calcular tu riesgo.",
  };
}
