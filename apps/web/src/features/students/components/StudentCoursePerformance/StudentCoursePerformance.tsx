import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCoursePerformance from "@/features/students/hooks/useStudentCoursePerformance";

interface StudentCoursePerformanceProps {
  courseId: string;
}

export default function StudentCoursePerformance({
  courseId,
}: StudentCoursePerformanceProps) {
  const { period, metrics, subjectAverage, isLoading, error } =
    useStudentCoursePerformance(courseId);
  const isValidSubjectAverage =
    subjectAverage !== null && subjectAverage >= 0 && subjectAverage <= 10;
  const isValidGlobalAverage =
    metrics !== null && metrics.globalAverage >= 0 && metrics.globalAverage <= 10;

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando rendimiento"
        description="Estamos consultando las métricas del periodo académico activo."
      />
    );
  }

  if (error) {
    return (
      <StudentPerformanceUnavailableCard
        title="No se pudo cargar el rendimiento"
        description={error}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <StudentPerformanceUnavailableCard
          title="Progreso semanal"
          description="El backend todavía no entrega una serie histórica semanal ni una proyección por materia."
        />
        <StudentPerformanceUnavailableCard
          title="Alertas de la materia"
          description="Las alertas existentes son generales del estudiante y no incluyen el identificador de la materia."
        />
        <StudentPerformanceUnavailableCard
          title="Riesgo de la materia"
          description="El riesgo disponible es global y usa valores neutros para asistencia, cumplimiento y tendencia; por eso no se presenta como riesgo de este curso."
        />
      </div>

      <div className="space-y-6">
        {isValidSubjectAverage ? (
          <CourseAverageChart
            average={subjectAverage}
            maxAverage={10}
            title="Promedio actual de la materia"
            description={`Calculado por Analytics para el periodo ${period?.name ?? "activo"}.`}
          />
        ) : (
          <StudentPerformanceUnavailableCard
            title="Promedio de la materia"
            description={
              subjectAverage !== null
                ? "Analytics devolvió un promedio fuera del rango válido de 0 a 10. Revisa los datos cargados."
                : metrics
                ? "Analytics no contiene un promedio asociado al identificador de este curso."
                : "Todavía no existen métricas procesadas para el periodo activo."
            }
          />
        )}

        {isValidGlobalAverage ? (
          <CourseAverageChart
            average={metrics.globalAverage}
            maxAverage={10}
            title="Promedio general del periodo"
            description={`Promedio global del estudiante en ${period?.name ?? "el periodo activo"}; no corresponde únicamente a esta materia.`}
          />
        ) : metrics ? (
          <StudentPerformanceUnavailableCard
            title="Promedio general del periodo"
            description="Analytics devolvió un promedio fuera del rango válido de 0 a 10. Revisa los datos cargados."
          />
        ) : null}

        <StudentPerformanceUnavailableCard
          title="Recomendaciones"
          description="Las recomendaciones existentes se generan desde un riesgo global incompleto y no están asociadas a esta materia."
        />
      </div>
    </div>
  );
}
