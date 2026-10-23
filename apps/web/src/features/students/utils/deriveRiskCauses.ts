import { PASSING_GRADE } from "@/utils/gradeScale";
import type {
  StudentSubjectAnalytics,
  SubjectTrendClassification,
} from "@/services/course-analytics.service";
import type { AttendanceStatus } from "@/types/academic/attendance.types";
import type { RiskLevelOrUnknown } from "@/types/risk";

interface DeriveRiskCausesParams {
  riskLevel: RiskLevelOrUnknown;
  average: number;
  trendClassification?: SubjectTrendClassification;
  factors: StudentSubjectAnalytics["risk"]["factors"];
  attendanceStatus?: AttendanceStatus;
  unjustifiedPct?: number | null;
  maxUnjustifiedPct?: number | null;
}

/**
 * Explica en palabras por qué la materia tiene ese nivel de riesgo, usando
 * solo datos reales: notas, faltas injustificadas y, si existen, el cumplimiento
 * y la comprensión que reporta el estudiante. No inventa probabilidades.
 */
export function deriveRiskCauses({
  riskLevel,
  average,
  trendClassification,
  factors,
  attendanceStatus,
  unjustifiedPct,
  maxUnjustifiedPct,
}: DeriveRiskCausesParams): string[] {
  if (riskLevel === "UNKNOWN") {
    return ["Aún no hay datos suficientes para valorar esta materia."];
  }
  if (riskLevel === "LOW") {
    return ["Sin señales de alerta con los datos actuales."];
  }

  const causes: string[] = [];

  if (average < PASSING_GRADE) {
    causes.push(
      `Notas bajas: promedio de ${average.toFixed(2)}, por debajo de ${PASSING_GRADE}.`,
    );
  }

  if (
    (attendanceStatus === "WARNING" || attendanceStatus === "EXCEEDED") &&
    unjustifiedPct !== null &&
    unjustifiedPct !== undefined
  ) {
    const limit = maxUnjustifiedPct ? ` (el límite es ${maxUnjustifiedPct} %)` : "";
    causes.push(`Faltas injustificadas: ${unjustifiedPct} % de las clases${limit}.`);
  }

  if (trendClassification === "DESCENDING") {
    causes.push("Tus notas vienen bajando en las últimas semanas.");
  }

  if (factors.complianceIndex !== null && factors.complianceIndex < 60) {
    causes.push(`Poco cumplimiento de tareas y entregas (${Math.round(factors.complianceIndex)} %).`);
  }

  if (factors.comprehensionAvg !== null && factors.comprehensionAvg < 60) {
    causes.push(`Comprensión baja de los temas (${Math.round(factors.comprehensionAvg)} %).`);
  }

  return causes.length > 0
    ? causes
    : ["No se identificó una causa puntual con los datos actuales."];
}