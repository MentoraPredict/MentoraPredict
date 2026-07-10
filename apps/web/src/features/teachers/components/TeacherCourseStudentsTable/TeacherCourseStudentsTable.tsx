import Text from "@/components/atoms/Text";
import TeacherCourseStudentsTableRow from "@/features/teachers/components/TeacherCourseStudentsTableRow";

import type { CourseEnrolledStudent } from "@/types/course";
import type { TeacherStudentPrediction } from "@/services/course-analytics.service";

interface TeacherCourseStudentsTableProps {
  students: CourseEnrolledStudent[];
  studentPredictionsById?: Map<string, TeacherStudentPrediction>;
  updatingEnrollmentId?: string | null;
  regeneratingPredictionStudentId?: string | null;
  onEnrollmentStatusChange?: (
    enrollmentId: string,
    isCurrentlyEnrolled: boolean,
  ) => void;
  onRegeneratePrediction?: (studentId: string) => void;
}

export default function TeacherCourseStudentsTable({
  students,
  studentPredictionsById,
  updatingEnrollmentId,
  regeneratingPredictionStudentId,
  onEnrollmentStatusChange,
  onRegeneratePrediction,
}: TeacherCourseStudentsTableProps) {
  return (
    <div
      className="
                overflow-hidden
                rounded-b-2xl
                border-x
                border-b
                border-gray-200
                bg-white
            "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
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
                  Matriculado
                </Text>
              </th>

              <th className="px-6 py-4">
                <Text
                  variant="caption"
                  className="font-bold uppercase tracking-[0.14em] text-gray-600"
                >
                  Estado
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
                isUpdating={updatingEnrollmentId === student.id}
                isRegeneratingPrediction={
                  regeneratingPredictionStudentId === student.user.id
                }
                onEnrollmentStatusChange={onEnrollmentStatusChange}
                onRegeneratePrediction={onRegeneratePrediction}
              />
            ))}

            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Text variant="small">
                    No existen estudiantes matriculados.
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
