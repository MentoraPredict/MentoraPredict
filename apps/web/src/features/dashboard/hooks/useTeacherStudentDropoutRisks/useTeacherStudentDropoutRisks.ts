import { useQuery } from "@tanstack/react-query";

import { getStudentRiskSignals } from "@/services/course-analytics.service";
import type { CourseEnrolledStudent } from "@/types/course";

import { getMockStudentDropoutRisk } from "../../mocks/dashboardKpi.mock";
import type { DropoutRiskEstimate } from "../../types/dashboard-kpi.types";

function studentsKey(students: CourseEnrolledStudent[]): string {
  return students
    .map((student) => `${student.user.id}:${student.average}:${student.attendance}`)
    .join(",");
}

/**
 * Riesgo de deserción de cada estudiante de una materia. Combina notas y
 * asistencia (ya cargadas) con el estado emocional y los ingresos a la
 * plataforma, que se piden al servicio de analítica; si esas señales no
 * están disponibles, el factor simplemente no se muestra. Un solo query
 * calcula todos los estimados, indexados por studentId.
 */
export default function useTeacherStudentDropoutRisks(
  courseId: string,
  students: CourseEnrolledStudent[]
) {
  const query = useQuery({
    queryKey: [
      "dashboard",
      "teacher",
      "student-dropout-risks",
      courseId,
      studentsKey(students),
    ],
    queryFn: async () => {
      const entries = await Promise.all(
        students.map(async (student) => {
          const signals = await getStudentRiskSignals(courseId, student.user.id).catch(
            () => null
          );
          const estimate = await getMockStudentDropoutRisk({
            id: student.user.id,
            average: student.average,
            attendance: student.attendance,
            signals,
          });
          return [student.user.id, estimate] as const;
        })
      );
      return Object.fromEntries(entries) as Record<string, DropoutRiskEstimate>;
    },
    enabled: students.length > 0,
  });

  return { data: query.data ?? {}, isLoading: query.isLoading };
}