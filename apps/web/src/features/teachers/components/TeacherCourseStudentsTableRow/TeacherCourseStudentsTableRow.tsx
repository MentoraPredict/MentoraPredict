import { useNavigate } from "react-router-dom";

import Text from "@/components/atoms/Text";
import { getTeacherCourseStudentDetailPath } from "@/routes/paths";

import type { CourseEnrolledStudent } from "@/types/course";
import type { TeacherStudentPrediction } from "@/services/course-analytics.service";

interface TeacherCourseStudentsTableRowProps {
  courseId: string;
  student: CourseEnrolledStudent;
  prediction?: TeacherStudentPrediction;
}

const RISK_LABELS = {
  CRITICAL: "Crítico",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
};

/** Cada registro abre la ficha del estudiante. */
export default function TeacherCourseStudentsTableRow({
  courseId,
  student,
  prediction,
}: TeacherCourseStudentsTableRowProps) {
  const navigate = useNavigate();
  const detailPath = getTeacherCourseStudentDetailPath(courseId, student.user.id);
  const riskLabel = prediction?.predictedRiskLevel
    ? RISK_LABELS[prediction.predictedRiskLevel]
    : "Sin predicción";

  return (
    <tr
      tabIndex={0}
      role="link"
      aria-label={`Ver a ${student.user.firstName ?? ""} ${student.user.lastName ?? ""}`.trim()}
      onClick={() => navigate(detailPath)}
      onKeyDown={(event) => {
        if (event.key === "Enter") navigate(detailPath);
      }}
      className="cursor-pointer border-t border-gray-200 transition hover:bg-blue-50/50 focus:bg-blue-50/50 focus:outline-none"
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
        <Text variant="small">
          {student.average === null ? "-" : `${student.average}/10`}
        </Text>
      </td>

      <td className="px-6 py-4">
        <Text variant="small">
          {student.attendance === null ? "-" : `${student.attendance}%`}
        </Text>
      </td>

      <td className="px-6 py-4">
        <Text variant="small">{riskLabel}</Text>
      </td>
    </tr>
  );
}