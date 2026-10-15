import type { RiskLevelOrUnknown } from "@/types/risk";

// Mocks deterministas para secciones del detalle de materia que hoy no
// tienen backend real (desglose de calificaciones por componente, ranking
// dentro de la materia, asistencia por sesiones, comparativo con el curso,
// actividades próximas) — mismo criterio que dashboardKpi.mock.ts: nunca
// Math.random(), todo derivado de un hash simple del subjectId combinado
// con datos reales ya disponibles (promedio, nivel de riesgo) cuando aplica.

const MOCK_LATENCY_MS = 300;

function withMockLatency<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_LATENCY_MS);
  });
}

function hashScore(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return hash;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface GradeComponentBreakdown {
  id: string;
  label: string;
  weightPercent: number;
  grade: number | null;
}

export function getMockGradeBreakdown(
  subjectId: string,
  average: number
): Promise<GradeComponentBreakdown[]> {
  const hash = hashScore(subjectId);
  const hasProjectGrade = hash % 2 === 0;

  const breakdown: GradeComponentBreakdown[] = [
    {
      id: "tareas",
      label: "Tareas",
      weightPercent: 30,
      grade: Math.round(clamp(average + 0.35, 0, 20) * 100) / 100,
    },
    {
      id: "quizzes",
      label: "Quizzes",
      weightPercent: 20,
      grade: Math.round(clamp(average - 0.25, 0, 20) * 100) / 100,
    },
    {
      id: "parciales",
      label: "Parciales",
      weightPercent: 30,
      grade: Math.round(clamp(average - 0.35, 0, 20) * 100) / 100,
    },
    {
      id: "proyecto",
      label: "Proyecto",
      weightPercent: 20,
      grade: hasProjectGrade ? Math.round(clamp(average + 0.1, 0, 20) * 100) / 100 : null,
    },
  ];

  return withMockLatency(breakdown);
}

export interface ClassRanking {
  position: number;
  totalStudents: number;
  betterThanPercent: number;
}

export function getMockClassRanking(subjectId: string, average: number): Promise<ClassRanking> {
  const hash = hashScore(subjectId);
  const totalStudents = 30 + (hash % 25); // banda 30-54, plausible para un curso

  // Promedios más altos deberían tender a mejores posiciones (número más
  // bajo = mejor), con algo de variación determinista por materia.
  const performanceRatio = clamp(average / 20, 0, 1);
  const worstPossiblePosition = totalStudents;
  const bestPossiblePosition = 1;
  const jitter = (hash % 7) - 3; // -3..3

  const position = Math.round(
    clamp(
      worstPossiblePosition - performanceRatio * (worstPossiblePosition - bestPossiblePosition) + jitter,
      1,
      totalStudents
    )
  );

  const betterThanPercent = Math.round(((totalStudents - position) / (totalStudents - 1)) * 100);

  return withMockLatency({ position, totalStudents, betterThanPercent });
}

export interface AttendanceDetail {
  sessionsAttended: number;
  sessionsTotal: number;
  ratePercent: number;
  recommendedThresholdPercent: number;
  isBelowThreshold: boolean;
}

const ATTENDANCE_RATE_BY_RISK: Record<RiskLevelOrUnknown, number> = {
  LOW: 92,
  MEDIUM: 75,
  HIGH: 58,
  CRITICAL: 45,
  UNKNOWN: 80,
};

/**
 * El porcentaje se ancla al factor real de asistencia ya calculado por
 * analytics-service (SubjectRisk.factors.attendanceRate) cuando existe —
 * solo el desglose en sesiones asistidas/totales se estima, para no
 * contradecir el dato real que ya se muestra en "Fortalezas y
 * oportunidades" y en "Factores del riesgo". Si no hay historial
 * suficiente (null), cae a una estimación por nivel de riesgo.
 */
export function getMockAttendanceDetail(
  subjectId: string,
  riskLevel: RiskLevelOrUnknown,
  realAttendanceRatePercent: number | null
): Promise<AttendanceDetail> {
  const hash = hashScore(subjectId);
  const sessionsTotal = 10 + (hash % 8); // banda 10-17
  const ratePercent = clamp(
    Math.round(realAttendanceRatePercent ?? ATTENDANCE_RATE_BY_RISK[riskLevel]),
    0,
    100
  );
  const sessionsAttended = Math.round((ratePercent / 100) * sessionsTotal);
  const recommendedThresholdPercent = 60;

  return withMockLatency({
    sessionsAttended,
    sessionsTotal,
    ratePercent: Math.round((sessionsAttended / sessionsTotal) * 100),
    recommendedThresholdPercent,
    isBelowThreshold: sessionsAttended / sessionsTotal < recommendedThresholdPercent / 100,
  });
}

export interface ComparativeMetrics {
  currentAverage: number;
  previousAverage: number | null;
  delta: number | null;
  classAverage: number;
  bestAverageInCourse: number;
  worstAverageInCourse: number;
}

export function getMockComparativeMetrics(
  subjectId: string,
  average: number
): Promise<ComparativeMetrics> {
  const hash = hashScore(subjectId);
  const previousAverage = Math.round(clamp(average - 0.1 - (hash % 5) / 10, 0, 20) * 100) / 100;
  const bestAverageInCourse = Math.round(clamp(average + 1.2 + (hash % 4), 0, 20) * 100) / 100;
  const worstAverageInCourse = Math.round(clamp(average - 2.5 - (hash % 4), 0, 20) * 100) / 100;
  // Desplazamiento con magnitud garantizada (nunca 0, para no empatar con
  // el promedio del propio estudiante) y signo determinista por materia.
  const classAverageOffset = (hash % 2 === 0 ? 1 : -1) * (0.3 + (hash % 5) / 10);
  const classAverage = Math.round(clamp(average + classAverageOffset, 0, 20) * 100) / 100;

  return withMockLatency({
    currentAverage: average,
    previousAverage,
    delta: Math.round((average - previousAverage) * 100) / 100,
    classAverage,
    bestAverageInCourse,
    worstAverageInCourse,
  });
}

export type UpcomingActivityType = "TASK" | "QUIZ" | "PROJECT";
export type UpcomingActivityStatus = "PENDING" | "NOT_STARTED";

export interface UpcomingActivity {
  id: string;
  title: string;
  type: UpcomingActivityType;
  dueInDays: number;
  status: UpcomingActivityStatus;
}

const ACTIVITY_TEMPLATES: Omit<UpcomingActivity, "id" | "dueInDays">[] = [
  { title: "Tarea: Ejercicios del tema actual", type: "TASK", status: "PENDING" },
  { title: "Quiz de seguimiento", type: "QUIZ", status: "PENDING" },
  { title: "Tarea: Aplicaciones prácticas", type: "TASK", status: "PENDING" },
  { title: "Proyecto final", type: "PROJECT", status: "NOT_STARTED" },
];

export function getMockUpcomingActivities(subjectId: string): Promise<UpcomingActivity[]> {
  const hash = hashScore(subjectId);

  const activities = ACTIVITY_TEMPLATES.map((template, index) => ({
    ...template,
    id: `${subjectId}-activity-${index}`,
    dueInDays: 3 + ((hash + index * 7) % 20),
  })).sort((a, b) => a.dueInDays - b.dueInDays);

  return withMockLatency(activities);
}

/** Sin latencia — deriva probabilidad numérica a partir del riesgo real ya
 * calculado por analytics-service, no de un valor inventado. */
export function estimateRiskProbabilityPercent(
  riskLevel: RiskLevelOrUnknown,
  subjectId: string
): number {
  const base: Record<RiskLevelOrUnknown, number> = {
    LOW: 12,
    MEDIUM: 45,
    HIGH: 72,
    CRITICAL: 90,
    UNKNOWN: 30,
  };
  const jitter = hashScore(subjectId) % 9;
  return clamp(base[riskLevel] + jitter, 0, 99);
}
