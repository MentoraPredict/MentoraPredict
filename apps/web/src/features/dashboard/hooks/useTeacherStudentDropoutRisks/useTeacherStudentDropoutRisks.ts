import { useQuery } from "@tanstack/react-query";

import type { CourseEnrolledStudent } from "@/types/course";

import { getMockStudentDropoutRisk } from "../../mocks/dashboardKpi.mock";
import type { DropoutRiskEstimate } from "../../types/dashboard-kpi.types";

function studentsKey(students: CourseEnrolledStudent[]): string {
  return students.map((student) => student.user.id).join(",");
}

/**
 * Pedido del usuario: la card de riesgo de deserción también en el
 * dashboard del docente, una por cada estudiante matriculado en sus
 * materias. Mismo principio de mock que el resto (ver
 * docs/frontend/dashboard-kpi-proposal.md §2) — un solo query computa
 * todos los estimados a la vez, indexados por studentId.
 */
export default function useTeacherStudentDropoutRisks(
  students: CourseEnrolledStudent[]
) {
  const query = useQuery({
    queryKey: ["dashboard", "teacher", "student-dropout-risks", studentsKey(students)],
    queryFn: async () => {
      const entries = await Promise.all(
        students.map(async (student) => {
          const estimate = await getMockStudentDropoutRisk({
            id: student.user.id,
            average: student.average,
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
