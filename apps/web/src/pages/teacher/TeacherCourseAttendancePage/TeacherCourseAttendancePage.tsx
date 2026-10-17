import { useOutletContext } from "react-router-dom";

import TeacherCourseAttendance from "@/features/teachers/components/TeacherCourseAttendance";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseAttendancePage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return <TeacherCourseAttendance courseId={course.id} />;
}
