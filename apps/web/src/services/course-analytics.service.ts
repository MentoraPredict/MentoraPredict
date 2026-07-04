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
  status: "COMPUTED" | "INSUFFICIENT_DATA";
  predictedRiskLevel: RiskLevel | null;
  recommendation: string | null;
}

interface SubjectRiskSummary {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
  unclassified: number;
}

function toAlert(alert: AlertResponse): CourseAlert {
  return {
    id: alert.id,
    message: alert.message,
    severity: alert.severity ?? "LOW",
  };
}

export async function getStudentSubjectAnalytics(subjectId: string) {
  const [metricsResponse, riskResponse, alertsResponse, predictionResponse] =
    await Promise.all([
      api.get<Paginated<SubjectMetric>>(
        endpoints.analytics.studentSubjectMetrics(subjectId),
        { params: { page: 1, limit: 100 } },
      ),
      api.get<SubjectRisk>(endpoints.analytics.studentSubjectRisk(subjectId)),
      api.get<Paginated<AlertResponse>>(endpoints.analytics.studentAlerts, {
        params: { subjectId, page: 1, limit: 100 },
      }),
      api.get<PredictionResponse | null>(
        endpoints.prediction.studentSubject(subjectId),
      ),
    ]);

  const metrics = metricsResponse.data.data;
  const latest = metrics[0] ?? null;
  const progress: CourseProgressPoint[] = [...metrics]
    .reverse()
    .map((metric) => ({
      week: `S${metric.academicWeek}`,
      actual: metric.averageGrade ?? 0,
    }));
  const factors: CourseRiskItem[] = [
    { id: "average", label: "Promedio", value: (riskResponse.data.factors.averageGrade ?? 0) * 10 },
    { id: "compliance", label: "Cumplimiento", value: riskResponse.data.factors.complianceIndex ?? 0 },
    { id: "attendance", label: "Asistencia", value: riskResponse.data.factors.attendanceRate ?? 0 },
    { id: "comprehension", label: "Comprensión", value: riskResponse.data.factors.comprehensionAvg ?? 0 },
  ];
  const prediction = predictionResponse.data;
  const recommendations: CourseRecommendation[] =
    prediction?.recommendation
      ? [{ id: prediction.id, title: "Recomendación", description: prediction.recommendation }]
      : [];

  return {
    average: latest?.averageGrade ?? riskResponse.data.factors.averageGrade ?? 0,
    progress,
    risk: riskResponse.data,
    riskFactors: factors,
    alerts: alertsResponse.data.data.map(toAlert),
    recommendations,
  };
}

export async function getTeacherSubjectAnalytics(subjectId: string) {
  const [summaryResponse, alertsResponse, predictionsResponse] = await Promise.all([
    api.get<SubjectRiskSummary>(endpoints.analytics.subjectSummary(subjectId)),
    api.get<Paginated<AlertResponse>>(endpoints.analytics.subjectAlerts(subjectId), {
      params: { page: 1, limit: 100 },
    }),
    api.get<Paginated<PredictionResponse>>(endpoints.prediction.subject(subjectId), {
      params: { page: 1, limit: 100 },
    }),
  ]);

  const summary = summaryResponse.data;
  const total = summary.LOW + summary.MEDIUM + summary.HIGH + summary.CRITICAL + summary.unclassified;
  const riskDistribution: CourseRiskItem[] = [
    ["CRITICAL", "Riesgo crítico", summary.CRITICAL],
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
    alerts: alertsResponse.data.data.map(toAlert),
    recommendations,
  };
}
