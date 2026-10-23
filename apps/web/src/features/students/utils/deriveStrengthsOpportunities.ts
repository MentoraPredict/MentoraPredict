import { PASSING_GRADE } from "@/utils/gradeScale";
import type {
  StudentSubjectAnalytics,
  SubjectTrendClassification,
} from "@/services/course-analytics.service";

export interface StrengthsOpportunities {
  strengths: string[];
  opportunities: string[];
}

interface DeriveParams {
  average: number;
  trendClassification?: SubjectTrendClassification;
  factors: StudentSubjectAnalytics["risk"]["factors"];
}

/**
 * Deriva "Fortalezas y oportunidades" a partir de datos reales ya
 * calculados por analytics-service (factores de riesgo, tendencia) —
 * no es un mock: si el factor no existe (sin historial suficiente), se
 * omite en vez de inventar un valor.
 */
export function deriveStrengthsAndOpportunities({
  average,
  trendClassification,
  factors,
}: DeriveParams): StrengthsOpportunities {
  const strengths: string[] = [];
  const opportunities: string[] = [];

  if (factors.complianceIndex !== null) {
    if (factors.complianceIndex >= 75) {
      strengths.push(
        `Buen cumplimiento de tareas y entregas (${Math.round(factors.complianceIndex)}%)`
      );
    } else if (factors.complianceIndex < 60) {
      opportunities.push("Mejorar el cumplimiento de tareas y entregas");
    }
  }

  if (factors.attendanceRate !== null) {
    if (factors.attendanceRate >= 80) {
      strengths.push("Buena asistencia a clases");
    } else if (factors.attendanceRate < 60) {
      opportunities.push("Mejorar la asistencia a clases");
    }
  }

  if (factors.comprehensionAvg !== null) {
    if (factors.comprehensionAvg >= 75) {
      strengths.push("Buena comprensión de los temas del sílabo");
    } else if (factors.comprehensionAvg < 60) {
      opportunities.push("Reforzar la comprensión de los temas del sílabo");
    }
  }

  if (trendClassification === "ASCENDING") {
    strengths.push("Tendencia de mejora en tus calificaciones");
  } else if (trendClassification === "DESCENDING") {
    opportunities.push("Revertir la tendencia descendente de tus calificaciones");
  }

  if (average >= PASSING_GRADE) {
    strengths.push("Promedio dentro del rango aprobatorio");
  } else {
    opportunities.push("Elevar el promedio general de la materia");
  }

  return {
    strengths: strengths.slice(0, 4),
    opportunities: opportunities.slice(0, 4),
  };
}
