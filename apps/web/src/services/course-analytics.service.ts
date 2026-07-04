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
      value: (risk.factors.averageGrade ?? 0) * 10,
    },
    {
      id: "compliance",
      label: "Cumplimiento",
      value: risk.factors.complianceIndex ?? 0,
    },
    {
      id: "attendance",
      label: "Asistencia",
      value: risk.factors.attendanceRate ?? 0,
    },
    {
      id: "comprehension",
      label: "Comprension",
      value: risk.factors.comprehensionAvg ?? 0,
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
    alerts: alertsResponse.data.data.map(toAlert),
    recommendations,
  };
}
