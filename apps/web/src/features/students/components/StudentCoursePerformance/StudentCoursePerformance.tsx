import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import CourseRiskStudentsPanel from "@/features/courses/components/CourseRiskStudentsPanel";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCoursePerformance from "@/features/students/hooks/useStudentCoursePerformance";
import type { Course } from "@/types/course";

interface StudentCoursePerformanceProps {
  courseId: string;
  course?: Course | null;
}

export default function StudentCoursePerformance({
  courseId,
  course,
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
    <div className="space-y-6">
      <MotionCard
        as="section"
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <Badge className="bg-blue-100 text-blue-700">
              Rendimiento academico
            </Badge>
            <Heading as="h4" className="mt-3 text-gray-900">
              {course?.name ?? "Detalle de materia"}
            </Heading>
            <Text variant="small" className="mt-2 max-w-2xl text-gray-600">
              Consulta el avance semanal, factores de riesgo, alertas y
              recomendaciones generadas con datos reales disponibles.
            </Text>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <Text
              variant="caption"
              className="font-bold uppercase text-gray-500"
            >
              Resumen
            </Text>
            <Text variant="small" className="mt-2 font-semibold text-gray-900">
              {course?.semester ?? "Periodo no registrado"}
            </Text>
            <Text variant="caption" className="mt-1 text-gray-600">
              {course?.careerName ?? "Carrera no registrada"}
            </Text>
          </div>
        </div>
      </MotionCard>

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
    </div>
  );
}
