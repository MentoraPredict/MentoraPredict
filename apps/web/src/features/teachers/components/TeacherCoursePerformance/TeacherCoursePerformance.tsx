import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import CourseRiskStudentsPanel from "@/features/courses/components/CourseRiskStudentsPanel";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useTeacherCourseAnalytics from "@/features/teachers/hooks/useTeacherCourseAnalytics";

interface TeacherCoursePerformanceProps {
  courseId: string;
}

export default function TeacherCoursePerformance({
  courseId,
}: TeacherCoursePerformanceProps) {
  const { data, isLoading, error } = useTeacherCourseAnalytics(courseId);

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando métricas"
        description="Estamos consultando la información real del curso."
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <CourseProgressChart
          data={[]}
          title="Progreso del curso"
          subtitle="Analytics todavía no entrega historial semanal agregado del curso"
        />
        <CourseAlertsPanel alerts={data.alerts} />
        <CourseRiskStudentsPanel
          students={data.riskDistribution}
          title="Distribución de riesgo del curso"
        />
      </div>

      <div className="space-y-6">
        <CourseAverageChart
          average={data.average}
          maxAverage={10}
          title="Promedio del curso"
        />
        <CourseRecommendationsPanel recommendations={data.recommendations} />
      </div>
    </div>
  );
}
