import type { Course } from "@/types/course";
import type { RiskLevel } from "@/types/risk";

import { isAtRiskLevel } from "../utils/riskLevelPresentation";
import type {
  ComplianceSummary,
  ComprehensionSummary,
  DashboardAttendanceSummary,
  DropoutRiskEstimate,
  DropoutRiskFactor,
  EngagementSummary,
  SubjectAttendanceBreakdown,
  SubjectComprehensionSummary,
  SurveyStatus,
  TeacherMockedMetrics,
} from "../types/dashboard-kpi.types";

// Mocks deterministas (docs/frontend/dashboard-kpi-proposal.md §9, decisión
// #3): mismos valores siempre para el mismo curso — nunca Math.random(). El
// día que exista el endpoint real, solo cambia la queryFn del hook
// correspondiente (ver ../hooks/useStudentDashboardKpis.ts); estas funciones
// dejan de importarse.

const MOCK_LATENCY_MS = 350;

function withMockLatency<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_LATENCY_MS);
  });
}

const ATTENDANCE_BY_RISK: Record<RiskLevel | "UNKNOWN", number> = {
  LOW: 94,
  MEDIUM: 82,
  HIGH: 68,
  CRITICAL: 52,
  UNKNOWN: 85,
};

const COMPLIANCE_BY_RISK: Record<RiskLevel | "UNKNOWN", number> = {
  LOW: 92,
  MEDIUM: 76,
  HIGH: 58,
  CRITICAL: 41,
  UNKNOWN: 80,
};

const COMPREHENSION_BY_RISK: Record<RiskLevel | "UNKNOWN", number> = {
  LOW: 88,
  MEDIUM: 74,
  HIGH: 60,
  CRITICAL: 45,
  UNKNOWN: 78,
};

function riskKey(course: Course): RiskLevel | "UNKNOWN" {
  return course.riskLevel;
}

export function getMockAttendanceSummary(
  courses: Course[]
): Promise<DashboardAttendanceSummary> {
  const subjects: SubjectAttendanceBreakdown[] = courses.map(
    (course, index) => {
      // Determinista, no aleatorio: la mitad "tiene horario definido"
      // (Fase B) por posición fija en la lista, no por Math.random().
      const hasSchedule = index % 2 === 0;
      const selfReportRate = ATTENDANCE_BY_RISK[riskKey(course)];
      const teacherRate = hasSchedule
        ? Math.max(0, selfReportRate - 6)
        : null;

      return {
        subjectId: course.id,
        sessionsHeld: hasSchedule ? 12 : 0,
        sessionsRecordedByTeacher: hasSchedule ? 9 : 0,
        attendanceRateTeacher: teacherRate,
        attendanceRateSelfReport: selfReportRate,
        effectiveAttendanceRate: teacherRate ?? selfReportRate,
        source: hasSchedule ? "TEACHER" : "NO_SCHEDULE",
      };
    }
  );

  const overallRate =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + s.effectiveAttendanceRate, 0) /
            subjects.length
        )
      : 0;

  return withMockLatency({
    overallRate,
    subjects,
    unscheduledSubjectsCount: subjects.filter((s) => s.source === "NO_SCHEDULE")
      .length,
  });
}

export function getMockComplianceSummary(
  courses: Course[]
): Promise<ComplianceSummary> {
  const bySubject = courses.map((course) => ({
    subjectId: course.id,
    complianceIndex: COMPLIANCE_BY_RISK[riskKey(course)],
  }));

  const overallComplianceIndex =
    bySubject.length > 0
      ? Math.round(
          bySubject.reduce((sum, s) => sum + s.complianceIndex, 0) /
            bySubject.length
        )
      : 0;

  return withMockLatency({ overallComplianceIndex, bySubject });
}

const MOCK_TOPIC_TITLES = ["Fundamentos", "Aplicación práctica", "Integración"];

export function getMockComprehensionSummary(
  courses: Course[]
): Promise<ComprehensionSummary> {
  const bySubject: SubjectComprehensionSummary[] = courses.map((course) => {
    const base = COMPREHENSION_BY_RISK[riskKey(course)];
    const weakestTopics = MOCK_TOPIC_TITLES.map((title, order) => ({
      topicId: `${course.id}-topic-${order}`,
      topicTitle: title,
      order,
      comprehension: Math.max(0, base - order * 8),
    })).sort((a, b) => a.comprehension - b.comprehension);

    return {
      subjectId: course.id,
      averageComprehension: base,
      weakestTopics: weakestTopics.slice(0, 2),
      trend:
        course.riskLevel === "LOW"
          ? "IMPROVING"
          : course.riskLevel === "CRITICAL" || course.riskLevel === "HIGH"
            ? "WORSENING"
            : "STABLE",
    };
  });

  const overallAverage =
    bySubject.length > 0
      ? Math.round(
          bySubject.reduce((sum, s) => sum + s.averageComprehension, 0) /
            bySubject.length
        )
      : 0;

  const worseningCount = bySubject.filter((s) => s.trend === "WORSENING").length;
  const trend: ComprehensionSummary["trend"] =
    worseningCount > bySubject.length / 2
      ? "WORSENING"
      : worseningCount === 0
        ? "IMPROVING"
        : "STABLE";

  return withMockLatency({ overallAverage, trend, bySubject });
}

export function getMockEngagementSummary(): Promise<EngagementSummary> {
  return withMockLatency({
    lastLoginAt: new Date().toISOString(),
    daysSinceLastLogin: 0,
    loginStreakDays: 5,
    loginCountLast30Days: 22,
    trend: "STABLE",
  });
}

export function getMockSurveyStatus(): Promise<SurveyStatus> {
  return withMockLatency({
    surveyCode: "SOCIOECONOMIC",
    hasResponded: false,
    lastSubmittedAt: null,
    isStale: false,
  });
}

function factorScoreFromRiskCounts(courses: Course[]): number {
  if (courses.length === 0) return 0;
  const weighted = courses.reduce((sum, course) => {
    if (course.riskLevel === "CRITICAL") return sum + 100;
    if (course.riskLevel === "HIGH") return sum + 75;
    if (course.riskLevel === "MEDIUM") return sum + 45;
    if (course.riskLevel === "LOW") return sum + 10;
    return sum + 30; // UNKNOWN
  }, 0);
  return Math.round(weighted / courses.length);
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

/**
 * Composite mock siguiendo el enfoque propuesto en
 * docs/business/dropout-prediction-proposal.md §7 — score ponderado
 * determinista, no un modelo entrenado. `isMocked: true` siempre hasta que
 * exista CalculateDropoutRiskUseCase real en analytics-service. Compartida
 * entre la vista del propio estudiante (score agregado entre sus materias)
 * y la vista del docente (score por estudiante individual) — ver
 * buildDropoutEstimate más abajo.
 */
export function getMockDropoutRiskEstimate(
  courses: Course[]
): Promise<DropoutRiskEstimate> {
  return withMockLatency(buildDropoutEstimate(factorScoreFromRiskCounts(courses)));
}

/** Determinista: sin Math.random(). Un hash simple del id como última
 * alternativa cuando no hay promedio (ej. estudiante sin notas aún). */
function hashScore(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100;
  }
  return 20 + (hash % 40); // banda 20-59, "riesgo bajo/medio" plausible
}

function factorScoreFromStudent(student: {
  id: string;
  average: number | null;
}): number {
  if (student.average === null) return hashScore(student.id);
  if (student.average >= 16) return 10;
  if (student.average >= 14) return 40;
  if (student.average >= 10) return 70;
  return 95;
}

/**
 * Igual que getMockDropoutRiskEstimate pero para UN estudiante puntual,
 * usado en el dashboard del docente (una card por estudiante matriculado
 * en sus materias) — docs/frontend/dashboard-kpi-proposal.md, pedido del
 * usuario de mostrar esta card "para cada estudiante" del lado docente.
 */
export function getMockStudentDropoutRisk(student: {
  id: string;
  average: number | null;
}): Promise<DropoutRiskEstimate> {
  return withMockLatency(buildDropoutEstimate(factorScoreFromStudent(student)));
}

function buildDropoutEstimate(riskFactorScore: number): DropoutRiskEstimate {
  const factors: DropoutRiskFactor[] = [
    {
      key: "AVERAGE_TREND",
      label: "Tendencia de promedio entre períodos",
      weight: 0.25,
      normalizedScore: riskFactorScore,
    },
    {
      key: "COMPLIANCE_TREND",
      label: "Tendencia de cumplimiento y asistencia",
      weight: 0.2,
      normalizedScore: riskFactorScore,
    },
    {
      key: "SUBJECT_LOAD_TREND",
      label: "Carga de materias entre períodos",
      weight: 0.1,
      normalizedScore: 20,
    },
    {
      key: "WITHDRAWALS",
      label: "Retiros acumulados en el período actual",
      weight: 0.1,
      normalizedScore: 15,
    },
    {
      key: "EMOTIONAL_STATE",
      label: "Estado emocional autorreportado",
      weight: 0.15,
      normalizedScore: riskFactorScore,
    },
    {
      key: "ALERT_FREQUENCY",
      label: "Frecuencia de alertas altas/críticas",
      weight: 0.1,
      normalizedScore: riskFactorScore,
    },
    {
      key: "ENGAGEMENT",
      label: "Actividad reciente en la plataforma",
      weight: 0.05,
      normalizedScore: 20,
    },
    {
      key: "SOCIOECONOMIC",
      label: "Encuesta socioeconómica",
      weight: 0.05,
      normalizedScore: 50,
    },
  ];

  const score = Math.round(
    factors.reduce((sum, factor) => sum + factor.normalizedScore * factor.weight, 0)
  );

  return {
    score,
    level: levelFromScore(score),
    factors,
    isMocked: true,
    dataSource: "MOCK_HEURISTIC",
    computedAt: new Date().toISOString(),
    disclaimer:
      "Estimación preliminar calculada en el frontend con datos limitados — todavía no existe un cálculo real de deserción en el backend.",
  };
}

/**
 * Parte mockeada del panel del docente (asistencia agregada, materias sin
 * horario, deserción estimada, tendencia) — ver docs/frontend/
 * dashboard-kpi-proposal.md §4. La parte real vive en
 * ../utils/computeTeacherRealMetrics.ts, sin mock.
 */
export function getMockTeacherMetrics(
  courses: Course[]
): Promise<TeacherMockedMetrics> {
  if (courses.length === 0) {
    return withMockLatency({
      averageAttendanceAcrossCourses: 0,
      coursesWithoutSchedule: 0,
      studentsAtDropoutRisk: 0,
      courseTrend: "STABLE",
    });
  }

  const attendanceRates = courses.map((course) => ATTENDANCE_BY_RISK[riskKey(course)]);
  const averageAttendanceAcrossCourses = Math.round(
    attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length
  );

  // Mismo criterio determinista que el mock de asistencia del estudiante:
  // la mitad "tiene horario" por posición fija en la lista, no al azar.
  const coursesWithoutSchedule = courses.filter((_, index) => index % 2 !== 0).length;

  const studentsAtDropoutRisk = courses.reduce((sum, course) => {
    const enrolled = course.enrolledCount ?? 0;
    const fraction =
      course.riskLevel === "CRITICAL"
        ? 0.5
        : course.riskLevel === "HIGH"
          ? 0.3
          : course.riskLevel === "MEDIUM"
            ? 0.15
            : 0.05;
    return sum + Math.round(enrolled * fraction);
  }, 0);

  const riskyCourseCount = courses.filter((course) =>
    isAtRiskLevel(course.riskLevel)
  ).length;
  const courseTrend: TeacherMockedMetrics["courseTrend"] =
    riskyCourseCount === 0
      ? "ASCENDING"
      : riskyCourseCount >= courses.length / 2
        ? "DESCENDING"
        : "STABLE";

  return withMockLatency({
    averageAttendanceAcrossCourses,
    coursesWithoutSchedule,
    studentsAtDropoutRisk,
    courseTrend,
  });
}
