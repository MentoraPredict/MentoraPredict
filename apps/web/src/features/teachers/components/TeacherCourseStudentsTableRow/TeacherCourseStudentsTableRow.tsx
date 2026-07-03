import Text from "@/components/atoms/Text";
import StudentEnrollmentCell from "@/features/teachers/components/StudentEnrollmentCell";

import type { CourseEnrolledStudent } from "@/types/course";

interface TeacherCourseStudentsTableRowProps {
  student: CourseEnrolledStudent;
  isUpdating?: boolean;
  onEnrollmentStatusChange?: (
    enrollmentId: string,
    isCurrentlyEnrolled: boolean,
  ) => void;
}

export default function TeacherCourseStudentsTableRow({
  student,
  isUpdating,
  onEnrollmentStatusChange,
}: TeacherCourseStudentsTableRowProps) {
  return (
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
    </tr>
  );
}
