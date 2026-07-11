import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  CourseAlert,
  CourseProgressPoint,
  CourseRecommendation,
  CourseRiskItem,
} from "@/types/course";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface SubjectMetric {
  id: string;
  academicWeek: number;
  averageGrade: number | null;
  complianceIndex: number | null;
  attendanceRate: number | null;
  studyHours: number | null;
  comprehensionAvg: number | null;
  riskLevel: RiskLevel | null;
  trendSlope: number | null;
}

interface SubjectRisk {
  riskLevel: RiskLevel | null;
  trendSlope: number | null;
  trendDirection: "IMPROVING" | "STABLE" | "WORSENING" | null;
  factors: {
    averageGrade: number | null;
    complianceIndex: number | null;
    attendanceRate: number | null;
    studyHours: number | null;
    comprehensionAvg: number | null;
  };
  weeksOfHistory: number;
}

interface AlertResponse {
  id: string;
  message: string;
  severity: "MEDIUM" | "HIGH" | "CRITICAL" | null;
}

interface PredictionResponse {
  id: string;
  studentId: string;
  subjectId?: string;
  periodId?: string;
  academicWeek?: number;
  academicYear?: number;
  status: "COMPUTED" | "INSUFFICIENT_DATA";
  predictedRiskLevel: RiskLevel | null;
  trendSlope: number | null;
  recommendation: string | null;
  computedAt?: string;
}

interface SubjectRiskSummary {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
  unclassified: number;
  averageGrade?: number | null;
}

export type TeacherStudentPrediction = PredictionResponse;

export interface AiRecommendationItem {
  type:
    | "STUDY_HABIT"
    | "TUTORING"
    | "TIME_MANAGEMENT"
    | "ATTENDANCE"
    | "SUBJECT_FOCUS"
    | "WELLBEING";
  title: string;
  reason: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface AiPrediction {
  studentId: string;
  periodId: string;
  risk: {
    riskLevel: RiskLevel;
    globalAverage: number;
    complianceIndex: number;
    attendance: number;
    failedEvaluations: number;
    trendSlope: number;
  };
  summary: string;
  recommendations: AiRecommendationItem[];
  modelVersion: string;
  generatedAt: string;
}

export interface StudentSubjectAnalytics {
  average: number;
  progress: CourseProgressPoint[];
  risk: SubjectRisk;
  riskFactors: CourseRiskItem[];
  alerts: CourseAlert[];
  recommendations: CourseRecommendation[];
  prediction: {
    data: PredictionResponse | null;
    status: "loaded" | "empty" | "error";
    message: string;
  };
}

const emptyRisk: SubjectRisk = {
  riskLevel: null,
  trendSlope: null,
  trendDirection: null,
  factors: {
    averageGrade: null,
    complianceIndex: null,
    attendanceRate: null,
    studyHours: null,
    comprehensionAvg: null,
  },
  weeksOfHistory: 0,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toAlert(alert: AlertResponse): CourseAlert {
  return {
    id: alert.id,
    message: alert.message,
    severity: alert.severity ?? "LOW",
  };
}

export async function getStudentSubjectAnalytics(
  subjectId: string
): Promise<StudentSubjectAnalytics> {
  const [metricsResponse, riskResponse, alertsResponse, predictionResponse] =
    await Promise.allSettled([
      api.get<Paginated<SubjectMetric>>(
        endpoints.analytics.studentSubjectMetrics(subjectId),
        { params: { page: 1, limit: 100 } }
      ),
      api.get<SubjectRisk>(endpoints.analytics.studentSubjectRisk(subjectId)),
      api.get<Paginated<AlertResponse>>(endpoints.analytics.studentAlerts, {
        params: { subjectId, page: 1, limit: 100 },
      }),
      api.get<PredictionResponse | null>(
        endpoints.prediction.studentSubject(subjectId)
      ),
    ]);

  const metrics =
    metricsResponse.status === "fulfilled" ? metricsResponse.value.data.data : [];
  const risk =
    riskResponse.status === "fulfilled" ? riskResponse.value.data : emptyRisk;
  const alerts =
    alertsResponse.status === "fulfilled" ? alertsResponse.value.data.data : [];
  const prediction =
    predictionResponse.status === "fulfilled"
      ? predictionResponse.value.data
      : null;
  const predictionStatus =
    predictionResponse.status === "rejected"
      ? "error"
      : prediction
        ? "loaded"
        : "empty";
  const predictionMessage =
    predictionResponse.status === "rejected"
      ? "No se pudo consultar prediction-service."
      : prediction
        ? "Prediccion recibida desde prediction-service."
        : "Prediction-service no devolvio una prediccion para esta materia.";

  const latest = metrics[0] ?? null;
  const progress: CourseProgressPoint[] = [...metrics]
    .reverse()
    .map((metric) => ({
      week: `S${metric.academicWeek}`,
      actual: metric.averageGrade ?? 0,
    }));

  const factors: CourseRiskItem[] = [
    {
      id: "average",
      label: "Promedio",
      value: round2((risk.factors.averageGrade ?? 0) * 5),
    },
    {
      id: "compliance",
      label: "Cumplimiento",
      value: round2(risk.factors.complianceIndex ?? 0),
    },
    {
      id: "attendance",
      label: "Asistencia",
      value: round2(risk.factors.attendanceRate ?? 0),
    },
    {
      id: "comprehension",
      label: "Comprension",
      value: round2(risk.factors.comprehensionAvg ?? 0),
    },
  ];

  const recommendations: CourseRecommendation[] = prediction?.recommendation
    ? [
        {
          id: prediction.id,
          title: "Recomendacion",
          description: prediction.recommendation,
        },
      ]
    : [];

  return {
    average: latest?.averageGrade ?? risk.factors.averageGrade ?? 0,
    progress,
    risk,
    riskFactors: factors,
    alerts: alerts.map(toAlert),
    recommendations,
    prediction: {
      data: prediction,
      status: predictionStatus,
      message: predictionMessage,
    },
  };
}

export async function getTeacherSubjectAnalytics(subjectId: string) {
  const [summaryResponse, alertsResponse, predictionsResponse] =
    await Promise.all([
      api.get<SubjectRiskSummary>(endpoints.analytics.subjectSummary(subjectId)),
      api.get<Paginated<AlertResponse>>(
        endpoints.analytics.subjectAlerts(subjectId),
        {
          params: { page: 1, limit: 100 },
        }
      ),
      api.get<Paginated<PredictionResponse>>(
        endpoints.prediction.subject(subjectId),
        {
          params: { page: 1, limit: 100 },
        }
      ),
    ]);

  const summary = summaryResponse.data;
  const total =
    summary.LOW +
    summary.MEDIUM +
    summary.HIGH +
    summary.CRITICAL +
    summary.unclassified;
  const riskDistribution: CourseRiskItem[] = [
    ["CRITICAL", "Riesgo critico", summary.CRITICAL],
    ["HIGH", "Riesgo alto", summary.HIGH],
    ["MEDIUM", "Riesgo medio", summary.MEDIUM],
    ["LOW", "Riesgo bajo", summary.LOW],
    ["NONE", "Sin clasificar", summary.unclassified],
  ].map(([id, label, count]) => ({
    id: String(id),
    label: `${label}: ${count}`,
    value: total > 0 ? (Number(count) / total) * 100 : 0,
  }));

  const recommendations = predictionsResponse.data.data
    .filter((prediction) => prediction.recommendation)
    .map((prediction) => ({
      id: prediction.id,
      title: `Estudiante ${prediction.studentId}`,
      description: prediction.recommendation!,
    }));

  return {
    riskDistribution,
    riskCounts: {
      low: summary.LOW,
      medium: summary.MEDIUM,
      high: summary.HIGH + summary.CRITICAL,
    },
    alerts: alertsResponse.data.data.map(toAlert),
    recommendations,
    predictions: predictionsResponse.data.data,
  };
}

// Lightweight companion to getTeacherSubjectAnalytics for callers that only
// need the course-level average (e.g. the admin course card), so they don't
// pay for the alerts/predictions calls that function also makes.
export async function getSubjectAverageGrade(
  subjectId: string
): Promise<number | null> {
  const response = await api.get<SubjectRiskSummary>(
    endpoints.analytics.subjectSummary(subjectId)
  );

  return response.data.averageGrade ?? null;
}

export async function getTeacherStudentSubjectPrediction(
  subjectId: string,
  studentId: string
): Promise<TeacherStudentPrediction | null> {
  const response = await api.get<TeacherStudentPrediction | null>(
    endpoints.prediction.teacherStudentSubject(subjectId, studentId)
  );

  return response.data;
}

export async function requestAiPrediction(
  periodId: string
): Promise<AiPrediction> {
  const response = await api.post<AiPrediction>(
    endpoints.prediction.generate(periodId)
  );

  return response.data;
}

export async function getLatestAiPrediction(
  studentId: string
): Promise<AiPrediction | null> {
  const response = await api.get<AiPrediction[]>(
    endpoints.prediction.history(studentId),
    { params: { limit: 1 } }
  );

  return response.data[0] ?? null;
}

export async function requestSubjectAiPrediction(
  subjectId: string
): Promise<AiPrediction> {
  const response = await api.post<AiPrediction>(
    endpoints.prediction.generateForSubject(subjectId)
  );

  return response.data;
}

export async function getLatestSubjectAiPrediction(
  studentId: string,
  subjectId: string
): Promise<AiPrediction | null> {
  const response = await api.get<AiPrediction[]>(
    endpoints.prediction.history(studentId),
    { params: { limit: 1, subjectId } }
  );

  return response.data[0] ?? null;
}
