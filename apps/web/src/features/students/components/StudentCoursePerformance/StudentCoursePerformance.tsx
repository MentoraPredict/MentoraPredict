import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiHash,
  FiRefreshCw,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { AxiosError } from "axios";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";
import AiRecommendationPanel from "@/features/courses/components/AiRecommendationPanel";
import ComparativeMetricsPanel from "@/features/courses/components/ComparativeMetricsPanel";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import GradeBreakdownDonutChart from "@/features/courses/components/GradeBreakdownDonutChart";
import StrengthsOpportunitiesPanel from "@/features/courses/components/StrengthsOpportunitiesPanel";
import CircularGaugeCard from "@/features/dashboard/components/CircularGaugeCard";
import type { DashboardMetricTone } from "@/features/dashboard/components/DashboardMetricCard";
import { getAverageTone } from "@/features/dashboard/utils/metricTone";
import { getRiskPresentation } from "@/features/dashboard/utils/riskLevelPresentation";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useCoursePerformanceExtras from "@/features/students/hooks/useCoursePerformanceExtras";
import useStudentCoursePerformance from "@/features/students/hooks/useStudentCoursePerformance";
import { estimateRiskProbabilityPercent } from "@/features/students/mocks/coursePerformanceExtras.mock";
import { buildPeriodProgress } from "@/utils/buildPeriodProgress";
import { deriveStrengthsAndOpportunities } from "@/features/students/utils/deriveStrengthsOpportunities";
import {
  getLatestSubjectAiPrediction,
  requestSubjectAiPrediction,
  type AiPrediction,
} from "@/services/course-analytics.service";
import { getActiveAcademicPeriod } from "@/services/student-performance.service";
import { useAuthStore } from "@/store/auth.store";
import type { Course } from "@/types/course";
import type { RiskLevelOrUnknown } from "@/types/risk";

function attendanceTone(ratePercent: number | null): DashboardMetricTone {
  if (ratePercent === null) return "neutral";
  if (ratePercent >= 80) return "success";
  if (ratePercent >= 60) return "warning";
  return "danger";
}

const SHORT_RISK_LABELS: Record<RiskLevelOrUnknown, string> = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
  CRITICAL: "Crítico",
  UNKNOWN: "Sin datos",
};

const kpiCardShellClassName = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";

interface StudentCoursePerformanceProps {
  courseId: string;
  course?: Course | null;
}

export default function StudentCoursePerformance({
  courseId,
  course,
}: StudentCoursePerformanceProps) {
  const { data, isLoading, error, reload } =
    useStudentCoursePerformance(courseId);
  const extras = useCoursePerformanceExtras(
    courseId,
    data?.average ?? 0,
    data?.risk.riskLevel ?? "UNKNOWN",
    data?.risk.factors.attendanceRate ?? null,
  );
  const { data: activePeriod } = useQuery({
    queryKey: ["academic-period", "active"],
    queryFn: getActiveAcademicPeriod,
  });
  const user = useAuthStore((state) => state.user);
  const [aiPrediction, setAiPrediction] = useState<AiPrediction | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isCancelled = false;
    setIsLoadingAi(true);

    getLatestSubjectAiPrediction(user.id, courseId)
      .then((prediction) => {
        if (!isCancelled) {
          setAiPrediction(prediction);
        }
      })
      .catch(() => {
        // Best-effort preload — the student can still generate a fresh one.
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingAi(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user?.id, courseId]);

  const handleGenerateSubjectAiPrediction = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const prediction = await requestSubjectAiPrediction(courseId);
      setAiPrediction(prediction);
    } catch (requestError) {
      if (
        requestError instanceof AxiosError &&
        requestError.response?.status === 429
      ) {
        setAiError(
          (requestError.response.data as { message?: string })?.message ??
            "Ya generaste una recomendacion para esta materia recientemente. Intenta mas tarde.",
        );
      } else {
        setAiError(
          "No se pudo generar la recomendacion con IA. Intenta nuevamente.",
        );
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando rendimiento"
        description="Estamos consultando las métricas reales de la materia."
      />
    );
  }

  if (error || !data) {
    return (
      <StudentPerformanceUnavailableCard
        title="No se pudo cargar el rendimiento"
        description={error ?? "No existen datos disponibles."}
      />
    );
  }

  const strengthsAndOpportunities = deriveStrengthsAndOpportunities({
    average: data.average,
    trendClassification: data.trend?.classification,
    factors: data.risk.factors,
  });
  const riskLevel = data.risk.riskLevel ?? "UNKNOWN";
  const riskPresentation = getRiskPresentation(riskLevel);
  const riskProbabilityPercent = estimateRiskProbabilityPercent(riskLevel, courseId);

  const classAverage = extras.comparative.data?.classAverage ?? null;
  const averageHint =
    classAverage === null
      ? "Comparando con el promedio de la clase…"
      : `${data.average < classAverage ? "Debajo" : "Encima"} del promedio de la clase (${classAverage.toFixed(2)})`;

  const attendanceDetail = extras.attendance.data;
  const attendanceHint = !attendanceDetail
    ? "Calculando asistencia…"
    : attendanceDetail.isBelowThreshold
      ? `Por debajo del ${attendanceDetail.recommendedThresholdPercent}% recomendado`
      : `${attendanceDetail.sessionsAttended} de ${attendanceDetail.sessionsTotal} clases asistidas`;

  const periodProgress = buildPeriodProgress(
    data.progress,
    activePeriod?.startDate ?? null,
    activePeriod?.endDate ?? null,
  );

  return (
    <div className="space-y-6">
      <MotionCard
        as="section"
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Heading as="h4" className="text-gray-900">
              {course?.name ?? "Detalle de materia"}
            </Heading>

            <div className="mt-3 space-y-1.5">
              {course?.code ? (
                <Text
                  variant="small"
                  className="flex items-center gap-2 text-gray-600"
                >
                  <FiHash size={14} className="text-gray-400" />
                  {course.code}
                </Text>
              ) : null}
              <Text
                variant="small"
                className="flex items-center gap-2 text-gray-600"
              >
                <FiUser size={14} className="text-gray-400" />
                {course?.teacherName ?? "Docente sin asignar"}
              </Text>
              <Text
                variant="small"
                className="flex items-center gap-2 text-gray-600"
              >
                <FiBookOpen size={14} className="text-gray-400" />
                {course?.careerName ?? "Carrera no registrada"}
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void reload();
            }}
            disabled={isLoading}
            className="gap-2 px-5 py-2 text-sm"
          >
            <FiRefreshCw size={16} />
            Recargar analitica
          </Button>
        </div>
      </MotionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CircularGaugeCard
          label="Mi promedio en la materia"
          value={data.average.toFixed(2)}
          hint={averageHint}
          icon={FiAward}
          tone={getAverageTone(data.average)}
          percentage={(data.average / 20) * 100}
        />

        <CircularGaugeCard
          label="Asistencia"
          value={attendanceDetail ? `${attendanceDetail.ratePercent}%` : "--"}
          hint={attendanceHint}
          icon={FiCalendar}
          tone={attendanceTone(attendanceDetail?.ratePercent ?? null)}
          percentage={attendanceDetail?.ratePercent ?? 0}
          isLoading={extras.attendance.isLoading}
        />

        <div className={kpiCardShellClassName}>
          <div className="flex items-center gap-2 text-gray-500">
            <FiTrendingUp size={16} />
            <Text variant="caption" className="font-bold uppercase text-gray-500">
              Mi riesgo académico
            </Text>
          </div>

          <span
            className={`mt-3 inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-bold ${riskPresentation.badgeClassName}`}
          >
            {SHORT_RISK_LABELS[riskLevel]}
          </span>

          <Text variant="caption" className="mt-3 flex items-center gap-1 text-gray-500">
            Probabilidad de riesgo: {riskProbabilityPercent}%
          </Text>
        </div>

        <div className={kpiCardShellClassName}>
          <div className="flex items-center gap-2 text-gray-500">
            <FiUsers size={16} />
            <Text variant="caption" className="font-bold uppercase text-gray-500">
              Posición en la materia
            </Text>
          </div>

          {extras.ranking.isLoading || !extras.ranking.data ? (
            <Heading as="h3" className="mt-2 text-gray-300">
              --
            </Heading>
          ) : (
            <>
              <Heading as="h3" className="mt-2 text-gray-900">
                {extras.ranking.data.position}{" "}
                <span className="text-lg font-medium text-gray-400">
                  / {extras.ranking.data.totalStudents}
                </span>
              </Heading>
              <Text variant="caption" className="mt-2 font-semibold text-emerald-600">
                Mejor que el {extras.ranking.data.betterThanPercent}% de la clase
              </Text>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CourseProgressChart
          data={periodProgress}
          title="Evolución de mi promedio"
          subtitle="Promedio real de la materia por semana"
          classification={data.trend?.classification}
        />
        <GradeBreakdownDonutChart
          breakdown={extras.gradeBreakdown.data}
          average={data.average}
          isLoading={extras.gradeBreakdown.isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StrengthsOpportunitiesPanel
          strengths={strengthsAndOpportunities.strengths}
          opportunities={strengthsAndOpportunities.opportunities}
        />
        <ComparativeMetricsPanel
          metrics={extras.comparative.data}
          isLoading={extras.comparative.isLoading}
        />
      </div>

      <div className="space-y-6">
        <CourseAlertsPanel
          alerts={data.alerts}
          title="Advertencias sobre tu rendimiento"
        />

        <AiRecommendationPanel
          title="Recomendacion con IA para esta materia"
          description="Basada en tu avance semanal y el silabo de la materia"
          prediction={aiPrediction}
          isLoading={isLoadingAi}
          isGenerating={isGeneratingAi}
          error={aiError}
          emptyMessage="Aun no has generado una recomendacion con IA para esta materia. Presiona el boton para generar una basada en tu avance semanal y el silabo."
          generateLabel="Generar recomendacion para esta materia"
          onGenerate={() => {
            void handleGenerateSubjectAiPrediction();
          }}
        />
      </div>
    </div>
  );
}
