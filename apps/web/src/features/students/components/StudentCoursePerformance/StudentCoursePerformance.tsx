import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiAward,
  FiCalendar,
  FiEye,
  FiHash,
  FiRefreshCw,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { AxiosError } from "axios";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";
import AiRecommendationPanel from "@/features/courses/components/AiRecommendationPanel";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import GradeBreakdownDonutChart from "@/features/courses/components/GradeBreakdownDonutChart";
import StrengthsOpportunitiesPanel from "@/features/courses/components/StrengthsOpportunitiesPanel";
import CircularGaugeCard from "@/features/dashboard/components/CircularGaugeCard";
import type { DashboardMetricTone } from "@/features/dashboard/components/DashboardMetricCard";
import { getAverageTone } from "@/features/dashboard/utils/metricTone";
import { getRiskPresentation } from "@/features/dashboard/utils/riskLevelPresentation";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useMyGradeBreakdown from "@/features/students/hooks/useMyGradeBreakdown";
import useStudentAttendance from "@/features/students/hooks/useStudentAttendance";
import useStudentCoursePerformance from "@/features/students/hooks/useStudentCoursePerformance";
import { buildPeriodProgress } from "@/utils/buildPeriodProgress";
import { MAX_GRADE } from "@/utils/gradeScale";
import { deriveRiskCauses } from "@/features/students/utils/deriveRiskCauses";
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
  const { data: activePeriod } = useQuery({
    queryKey: ["academic-period", "active"],
    queryFn: getActiveAcademicPeriod,
  });
  const user = useAuthStore((state) => state.user);
  const attendanceReport = useStudentAttendance(user?.id);
  const gradeBreakdown = useMyGradeBreakdown(courseId);
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
            "Ya generaste una recomendación para esta materia recientemente. Inténtalo más tarde.",
        );
      } else {
        setAiError(
          "No se pudo generar la recomendación con IA. Inténtalo nuevamente.",
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

  // Asistencia real de la materia, tomada del registro del docente.
  const courseAttendance = attendanceReport.data?.courses.find(
    (item) => item.subjectId === courseId,
  );
  const sessionsHeld = courseAttendance?.summary.held ?? 0;
  const sessionsAttended = sessionsHeld - (courseAttendance?.summary.absences ?? 0);
  const attendanceRate =
    sessionsHeld > 0 ? Math.round((sessionsAttended / sessionsHeld) * 100) : null;
  const riskCauses = deriveRiskCauses({
    riskLevel,
    average: data.average,
    trendClassification: data.trend?.classification,
    factors: data.risk.factors,
    attendanceStatus: courseAttendance?.status,
    unjustifiedPct: courseAttendance?.summary.unjustifiedPct,
    maxUnjustifiedPct: attendanceReport.data?.rule.maxPct,
  });
  const comprehension = data.risk.factors.comprehensionAvg;
  const attendanceHint =
    attendanceRate === null
      ? "Aún no hay clases registradas"
      : `${sessionsAttended} de ${sessionsHeld} clases asistidas`;
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
            Recargar analítica
          </Button>
        </div>
      </MotionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CircularGaugeCard
          label="Mi promedio en la materia"
          value={data.average.toFixed(2)}
          hint="Escala 0-10"
          icon={FiAward}
          tone={getAverageTone(data.average)}
          percentage={(data.average / MAX_GRADE) * 100}
        />

        <CircularGaugeCard
          label="Asistencia"
          value={attendanceRate === null ? "--" : `${attendanceRate}%`}
          hint={attendanceHint}
          icon={FiCalendar}
          tone={attendanceTone(attendanceRate)}
          percentage={attendanceRate ?? 0}
          isLoading={attendanceReport.isLoading}
        />

        <CircularGaugeCard
          label="Comprensión de los temas"
          value={comprehension === null ? "--" : `${Math.round(comprehension)}%`}
          hint={
            comprehension === null
              ? "Responde la encuesta del sílabo para verla"
              : "Lo que tú reportas de los temas del sílabo"
          }
          icon={FiEye}
          tone={getAverageTone(comprehension === null ? null : comprehension / 10)}
          percentage={comprehension ?? 0}
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

          <Text variant="caption" className="mt-3 font-semibold text-gray-600">
            {riskLevel === "LOW" || riskLevel === "UNKNOWN" ? "Situación" : "Por qué"}
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {riskCauses.map((cause) => (
              <li key={cause} className="text-xs text-gray-600">
                {cause}
              </li>
            ))}
          </ul>
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
          breakdown={gradeBreakdown.breakdown}
          isLoading={gradeBreakdown.isLoading}
          hasError={gradeBreakdown.hasError}
        />
      </div>

      <StrengthsOpportunitiesPanel
        strengths={strengthsAndOpportunities.strengths}
        opportunities={strengthsAndOpportunities.opportunities}
      />
      <div className="space-y-6">
        <CourseAlertsPanel
          alerts={data.alerts}
          title="Advertencias sobre tu rendimiento"
        />

        <AiRecommendationPanel
          title="Recomendación con IA para esta materia"
          description="Basada en tu avance semanal y el sílabo de la materia"
          prediction={aiPrediction}
          isLoading={isLoadingAi}
          isGenerating={isGeneratingAi}
          error={aiError}
          emptyMessage="Aún no has generado una recomendación con IA para esta materia. Presiona el botón para generar una basada en tu avance semanal y el sílabo."
          generateLabel="Generar recomendación para esta materia"
          onGenerate={() => {
            void handleGenerateSubjectAiPrediction();
          }}
        />
      </div>
    </div>
  );
}
