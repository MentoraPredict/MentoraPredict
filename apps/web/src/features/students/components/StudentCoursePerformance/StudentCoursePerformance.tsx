import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import CourseRiskStudentsPanel from "@/features/courses/components/CourseRiskStudentsPanel";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCoursePerformance from "@/features/students/hooks/useStudentCoursePerformance";

interface StudentCoursePerformanceProps {
  courseId: string;
}

export default function StudentCoursePerformance({
  courseId,
}: StudentCoursePerformanceProps) {
  const { data, isLoading, error } = useStudentCoursePerformance(courseId);

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

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <CourseProgressChart
          data={data.progress}
          title="Progreso semanal"
          subtitle="Promedio real de la materia por semana"
        />
        <CourseAlertsPanel alerts={data.alerts} />
        <CourseRiskStudentsPanel
          students={data.riskFactors}
          title="Factores del riesgo"
        />
      </div>

      <div className="space-y-6">
        <CourseAverageChart
          average={data.average}
          maxAverage={10}
          title="Promedio actual de la materia"
        />
        <CourseRecommendationsPanel recommendations={data.recommendations} />
      </div>
    </div>
  );
}
