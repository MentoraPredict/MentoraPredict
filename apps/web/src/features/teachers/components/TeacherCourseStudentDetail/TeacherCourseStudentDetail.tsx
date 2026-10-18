import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import DashboardMetricCard, {
  type DashboardMetricTone,
} from "@/features/dashboard/components/DashboardMetricCard";
import DropoutRiskCard from "@/features/dashboard/components/DropoutRiskCard";
import useTeacherStudentDropoutRisks from "@/features/dashboard/hooks/useTeacherStudentDropoutRisks";
import { getAverageTone } from "@/features/dashboard/utils/metricTone";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useTeacherCourseAnalytics from "@/features/teachers/hooks/useTeacherCourseAnalytics";
import { getTeacherCourseStudentsPath } from "@/routes/paths";
import {
  getTeacherStudentProgress,
  getTeacherStudentSubjectPrediction,
  type TeacherStudentPrediction,
} from "@/services/course-analytics.service";
import { getActiveAcademicPeriod } from "@/services/student-performance.service";
import { buildPeriodProgress } from "@/utils/buildPeriodProgress";
import { MAX_GRADE } from "@/utils/gradeScale";

interface TeacherCourseStudentDetailProps {
  courseId: string;
  studentId: string;
}

const RISK_LABELS: Record<string, string> = {
  CRITICAL: "Crítico",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
};

const RISK_TONES: Record<string, DashboardMetricTone> = {
  CRITICAL: "danger",
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
};

function attendanceTone(percent: number | null): DashboardMetricTone {
  if (percent === null) return "neutral";
  if (percent >= 80) return "success";
  if (percent >= 60) return "warning";
  return "danger";
}

/** Ficha de un estudiante en la materia: datos, riesgo esperado, progreso y riesgo de deserción. */
export default function TeacherCourseStudentDetail({
  courseId,
  studentId,
}: TeacherCourseStudentDetailProps) {
  const { hash } = useLocation();
  const { data, isLoading, error } = useTeacherCourseAnalytics(courseId);
  const { data: activePeriod } = useQuery({
    queryKey: ["academic-period", "active"],
    queryFn: getActiveAcademicPeriod,
  });
  const progress = useQuery({
    queryKey: ["teacher-student-progress", courseId, studentId],
    queryFn: () => getTeacherStudentProgress(courseId, studentId),
  });
  const [regenerated, setRegenerated] =
    useState<TeacherStudentPrediction | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const student = useMemo(
    () => data?.students.find((item) => item.user.id === studentId) ?? null,
    [data?.students, studentId],
  );
  const dropoutRisks = useTeacherStudentDropoutRisks(
    courseId,
    student ? [student] : [],
  );

  useEffect(() => {
    if (!student || hash !== "#riesgo-desercion") return;
    document
      .getElementById("riesgo-desercion")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [student, hash]);

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando estudiante"
        description="Estamos consultando la información del estudiante."
      />
    );
  }

  if (error || !data || !student) {
    return (
      <StudentPerformanceUnavailableCard
        title="No se encontró al estudiante"
        description={
          error ?? "El estudiante no está matriculado en esta materia."
        }
      />
    );
  }

  const prediction =
    regenerated ??
    data.predictions.find((item) => item.studentId === studentId) ??
    null;
  const riskLevel = prediction?.predictedRiskLevel ?? null;
  const fullName =
    [student.user.firstName, student.user.lastName].filter(Boolean).join(" ") ||
    student.user.email;
  const studentAlerts = data.alerts.filter((alert) => alert.studentId === studentId);
  const periodProgress = buildPeriodProgress(
    progress.data?.progress ?? [],
    activePeriod?.startDate ?? null,
    activePeriod?.endDate ?? null,
  );

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setActionError(null);

    try {
      const next = await getTeacherStudentSubjectPrediction(courseId, studentId);
      if (next) setRegenerated(next);
      else setActionError("No se obtuvo una recomendación para este estudiante.");
    } catch {
      setActionError("No se pudo actualizar la recomendación.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={getTeacherCourseStudentsPath(courseId)}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
        >
          <FiArrowLeft size={14} aria-hidden="true" />
          Volver a estudiantes
        </Link>
        <Heading as="h3" className="mt-3 text-gray-900">
          {fullName}
        </Heading>
        <Text variant="small" className="text-gray-600">
          {student.user.email}
        </Text>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Promedio en la materia"
          value={
            student.average === null
              ? "--"
              : `${student.average} / ${MAX_GRADE}`
          }
          tone={getAverageTone(student.average)}
        />
        <DashboardMetricCard
          label="Asistencia"
          value={student.attendance === null ? "--" : `${student.attendance}%`}
          tone={attendanceTone(student.attendance)}
        />
        <DashboardMetricCard
          label="Riesgo esperado"
          value={riskLevel ? RISK_LABELS[riskLevel] : "Sin predicción"}
          tone={riskLevel ? RISK_TONES[riskLevel] : "neutral"}
        />
      </div>

      <section className="rounded-2xl border border-cyan-200 bg-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Heading as="h4" className="text-blue-900">
              Recomendación para este estudiante
            </Heading>
            <Text variant="small" className="mt-2 text-blue-950">
              {prediction?.recommendation ??
                "Aún no hay una recomendación predictiva disponible para este estudiante en esta materia."}
            </Text>
            {actionError ? (
              <Text variant="caption" className="mt-2 text-red-700">
                {actionError}
              </Text>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isRegenerating}
            onClick={() => void handleRegenerate()}
            className="shrink-0 px-3 py-2 text-xs"
          >
            {isRegenerating ? "Generando..." : "Volver a generar"}
          </Button>
        </div>
      </section>

      <CourseProgressChart
        data={periodProgress}
        title="Progreso del estudiante"
        subtitle="Promedio semanal en esta materia"
        classification={progress.data?.trend?.classification ?? undefined}
      />

      {studentAlerts.length > 0 ? (
        <CourseAlertsPanel
          alerts={studentAlerts}
          title="Advertencias del estudiante"
        />
      ) : null}

      <section id="riesgo-desercion" className="scroll-mt-6 space-y-3">
        <Text
          variant="caption"
          className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800"
        >
          Estimación preliminar con datos de ejemplo, mientras se define cómo se
          calculará el riesgo en el colegio. No la uses para tomar decisiones
          sobre un estudiante.
        </Text>
        <DropoutRiskCard
          estimate={dropoutRisks.data[student.user.id] ?? null}
          isLoading={dropoutRisks.isLoading}
          title="Riesgo de deserción"
          subtitle="Estimación para este estudiante"
          defaultShowFactors
        />
      </section>
    </div>
  );
}
