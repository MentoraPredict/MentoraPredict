import Text from "@/components/atoms/Text";
import TeacherCourseStudentsTableRow from "@/features/teachers/components/TeacherCourseStudentsTableRow";

import type { CourseEnrolledStudent } from "@/types/course";
import type { TeacherStudentPrediction } from "@/services/course-analytics.service";

interface TeacherCourseStudentsTableProps {
  students: CourseEnrolledStudent[];
  studentPredictionsById?: Map<string, TeacherStudentPrediction>;
  regeneratingPredictionStudentId?: string | null;
  onRegeneratePrediction?: (studentId: string) => void;
  /** Sin borde propio, para usarla dentro de un grupo colapsable. */
  bare?: boolean;
}

export default function TeacherCourseStudentsTable({
  students,
  studentPredictionsById,
  regeneratingPredictionStudentId,
  onRegeneratePrediction,
  bare = false,
}: TeacherCourseStudentsTableProps) {
  return (
    <div
      className={
        bare
          ? "overflow-hidden bg-white"
          : "overflow-hidden rounded-2xl border border-gray-200 bg-white"
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Apellido
                </Text>
              </th>

              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Nombre
                </Text>
              </th>

              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Correo
                </Text>
              </th>

              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Promedio
                </Text>
              </th>

              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Asistencia
                </Text>
              </th>

              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Detalle
                </Text>
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <TeacherCourseStudentsTableRow
                key={student.id}
                student={student}
                prediction={studentPredictionsById?.get(student.user.id)}
                isRegeneratingPrediction={
                  regeneratingPredictionStudentId === student.user.id
                }
                onRegeneratePrediction={onRegeneratePrediction}
              />
            ))}

            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Text variant="small">
                    No hay estudiantes que mostrar.
                  </Text>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
