import { Fragment, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import StudentEnrollmentCell from "@/features/teachers/components/StudentEnrollmentCell";

import type { CourseEnrolledStudent } from "@/types/course";
import type { TeacherStudentPrediction } from "@/services/course-analytics.service";

interface TeacherCourseStudentsTableRowProps {
  student: CourseEnrolledStudent;
  prediction?: TeacherStudentPrediction;
  isUpdating?: boolean;
  isRegeneratingPrediction?: boolean;
  onEnrollmentStatusChange?: (
    enrollmentId: string,
    isCurrentlyEnrolled: boolean,
  ) => void;
  onRegeneratePrediction?: (studentId: string) => void;
}

export default function TeacherCourseStudentsTableRow({
  student,
  prediction,
  isUpdating,
  isRegeneratingPrediction,
  onEnrollmentStatusChange,
  onRegeneratePrediction,
}: TeacherCourseStudentsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const riskLabel = prediction?.predictedRiskLevel
    ? {
        CRITICAL: "Critico",
        HIGH: "Alto",
        MEDIUM: "Medio",
        LOW: "Bajo",
      }[prediction.predictedRiskLevel]
    : "Sin prediccion";

  return (
    <Fragment>
      <tr
        className="
                  border-t
                  border-gray-200
                  transition
                  hover:bg-gray-50
              "
      >
        <td className="px-6 py-4">
          <Text variant="small" className="font-medium text-gray-900">
            {student.user.lastName ?? "-"}
          </Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small">{student.user.firstName ?? "-"}</Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small" className="text-gray-700">
            {student.user.email || "-"}
          </Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small">
            {student.average === null ? "-" : `${student.average}/20`}
          </Text>
        </td>

        <td className="px-6 py-4">
          <Text variant="small">
            {student.attendance === null ? "-" : `${student.attendance}%`}
          </Text>
        </td>

        <td className="px-6 py-4">
          <StudentEnrollmentCell
            isEnrolled={student.isEnrolled}
            isUpdating={isUpdating}
            onStatusChange={() =>
              onEnrollmentStatusChange?.(student.id, student.isEnrolled)
            }
          />
        </td>

        <td className="px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsExpanded((current) => !current);
            }}
            className="gap-2 px-3 py-2 text-xs"
          >
            {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            Estado
          </Button>
        </td>
      </tr>

      {isExpanded ? (
        <tr className="border-t border-blue-100 bg-blue-50/60">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-white bg-white p-4">
                  <Text variant="caption" className="font-bold uppercase text-gray-500">
                    Promedio
                  </Text>
                  <Text variant="small" className="mt-1 font-semibold text-gray-900">
                    {student.average === null ? "Sin datos" : `${student.average}/20`}
                  </Text>
                </div>
                <div className="rounded-xl border border-white bg-white p-4">
                  <Text variant="caption" className="font-bold uppercase text-gray-500">
                    Asistencia
                  </Text>
                  <Text variant="small" className="mt-1 font-semibold text-gray-900">
                    {student.attendance === null ? "Sin datos" : `${student.attendance}%`}
                  </Text>
                </div>
                <div className="rounded-xl border border-white bg-white p-4">
                  <Text variant="caption" className="font-bold uppercase text-gray-500">
                    Riesgo esperado
                  </Text>
                  <Text variant="small" className="mt-1 font-semibold text-gray-900">
                    {riskLabel}
                  </Text>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Text variant="caption" className="font-bold uppercase text-blue-700">
                      Recomendacion para este estudiante
                    </Text>
                    <Text variant="small" className="mt-2 text-blue-950">
                      {prediction?.recommendation ??
                        "Aun no hay una recomendacion predictiva disponible para este estudiante en esta materia."}
                    </Text>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isRegeneratingPrediction}
                    onClick={() => {
                      onRegeneratePrediction?.(student.user.id);
                    }}
                    className="shrink-0 px-3 py-2 text-xs"
                  >
                    {isRegeneratingPrediction
                      ? "Generando..."
                      : "Volver a generar"}
                  </Button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}
