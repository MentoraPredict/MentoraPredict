import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { FiChevronDown } from "react-icons/fi";

import Text from "@/components/atoms/Text";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import DashboardMetricCard from "@/features/dashboard/components/DashboardMetricCard";
import { getAverageTone } from "@/features/dashboard/utils/metricTone";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import StudentPickerModal from "@/features/teachers/components/StudentPickerModal";
import useTeacherCourseAnalytics from "@/features/teachers/hooks/useTeacherCourseAnalytics";
import { getTeacherCourseStudentsPath } from "@/routes/paths";
import { getTeacherStudentProgress } from "@/services/course-analytics.service";
import { getActiveAcademicPeriod } from "@/services/student-performance.service";
import { buildPeriodProgress } from "@/utils/buildPeriodProgress";
import { MAX_GRADE } from "@/utils/gradeScale";

interface TeacherCoursePerformanceProps {
  courseId: string;
}

type RiskGroup = "high" | "medium" | "low";

const RISK_GROUPS: {
  id: RiskGroup;
  label: string;
  /** Valor del filtro «Riesgo esperado» de la pestaña Estudiantes. */
  filter: string;
  className: string;
}[] = [
  {
    id: "high",
    label: "Riesgo alto",
    filter: "HIGH,CRITICAL",
    className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  },
  {
    id: "medium",
    label: "Riesgo medio",
    filter: "MEDIUM",
    className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    id: "low",
    label: "Riesgo bajo",
    filter: "LOW",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
];

export default function TeacherCoursePerformance({
  courseId,
}: TeacherCoursePerformanceProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useTeacherCourseAnalytics(courseId);
  const { data: activePeriod } = useQuery({
    queryKey: ["academic-period", "active"],
    queryFn: getActiveAcademicPeriod,
  });
  const [progressStudentId, setProgressStudentId] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const studentProgress = useQuery({
    queryKey: ["teacher-student-progress", courseId, progressStudentId],
    queryFn: () => getTeacherStudentProgress(courseId, progressStudentId),
    enabled: Boolean(progressStudentId),
  });

  const riskCounts = useMemo(() => {
    const counts: Record<RiskGroup, number> = { high: 0, medium: 0, low: 0 };
    const levelByStudentId = new Map(
      data?.predictions.map((prediction) => [
        prediction.studentId,
        prediction.predictedRiskLevel,
      ]) ?? [],
    );

    data?.students.forEach((student) => {
      const level = levelByStudentId.get(student.user.id);

      if (level === "CRITICAL" || level === "HIGH") counts.high += 1;
      else if (level === "MEDIUM") counts.medium += 1;
      else if (level === "LOW") counts.low += 1;
    });

    return counts;
  }, [data?.students, data?.predictions]);

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando métricas"
        description="Estamos consultando la información del curso."
      />
    );
  }

  if (error || !data) {
    return (
      <StudentPerformanceUnavailableCard
        title="No se pudieron cargar las métricas"
        description={error ?? "No existen datos disponibles."}
      />
    );
  }

  const selectedStudent = data.students.find(
    (student) => student.user.id === progressStudentId,
  );
  const selectedStudentName = selectedStudent
    ? [selectedStudent.user.firstName, selectedStudent.user.lastName]
        .filter(Boolean)
        .join(" ") || selectedStudent.user.email
    : "Todos los estudiantes";
  const periodProgress = buildPeriodProgress(
    progressStudentId ? (studentProgress.data?.progress ?? []) : data.progress,
    activePeriod?.startDate ?? null,
    activePeriod?.endDate ?? null,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardMetricCard
          label="Promedio del curso"
          value={`${data.average.toFixed(2)} / ${MAX_GRADE}`}
          tone={getAverageTone(data.average)}
        />

        <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white py-5 pl-7 pr-5 shadow-sm">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1.5 bg-blue-600"
          />
          <Text
            variant="caption"
            className="font-semibold uppercase tracking-wide text-gray-500"
          >
            Total de estudiantes
          </Text>
          <p className="mt-2 text-3xl font-bold leading-tight text-gray-900">
            {data.students.length}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {RISK_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                title="Ver estos estudiantes en la pestaña Estudiantes"
                onClick={() =>
                  navigate(
                    `${getTeacherCourseStudentsPath(courseId)}?risk=${encodeURIComponent(group.filter)}`,
                  )
                }
                className={`
                  cursor-pointer
                  rounded-xl
                  border-2
                  px-2
                  py-2
                  text-center
                  font-semibold
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                  active:translate-y-0
                  active:shadow-sm
                  ${group.className}
                `}
              >
                <span className="block text-xs uppercase opacity-80">
                  {group.label}
                </span>
                <span className="block text-xl">{riskCounts[group.id]}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <CourseAlertsPanel alerts={data.alerts} title="Advertencias del curso" />

      <div className="w-full">
        <CourseProgressChart
          data={periodProgress}
          title={progressStudentId ? "Progreso del estudiante" : "Progreso del curso"}
          subtitle={
            progressStudentId
              ? "Promedio semanal del estudiante seleccionado"
              : "Promedio general de todos los estudiantes por semana"
          }
          classification={
            progressStudentId
              ? (studentProgress.data?.trend?.classification ?? undefined)
              : data.trend?.classification
          }
          headerAction={
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex h-11 min-w-56 items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 transition hover:border-blue-400 hover:bg-blue-50"
            >
              <span className="truncate">{selectedStudentName}</span>
              <FiChevronDown size={16} aria-hidden="true" />
            </button>
          }        />
      </div>

      <StudentPickerModal
        isOpen={isPickerOpen}
        students={data.students}
        selectedId={progressStudentId}
        onSelect={setProgressStudentId}
        onClose={() => setIsPickerOpen(false)}
      />
    </div>
  );
}
