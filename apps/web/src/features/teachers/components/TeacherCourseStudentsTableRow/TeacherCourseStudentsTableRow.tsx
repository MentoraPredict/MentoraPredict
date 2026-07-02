import Text from "@/components/atoms/Text";
import StudentEnrollmentCell from "@/features/teachers/components/StudentEnrollmentCell";

import type { CourseEnrolledStudent } from "@/types/course";

interface TeacherCourseStudentsTableRowProps {
  student: CourseEnrolledStudent;
  onUnenrollStudent: (studentId: string) => void;
}

export default function TeacherCourseStudentsTableRow({
  student,
  onUnenrollStudent,
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
        <Text variant="small">{student.average}/20</Text>
      </td>

      <td className="px-6 py-4">
        <Text variant="small">{student.attendance}%</Text>
      </td>

      <td className="px-6 py-4">
        <StudentEnrollmentCell
          isEnrolled={student.isEnrolled}
          onUnenroll={() => {
            onUnenrollStudent(student.id);
          }}
        />
      </td>
    </tr>
  );
}
