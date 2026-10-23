import { useOutletContext, useParams } from "react-router-dom";

import TeacherCourseStudentDetail from "@/features/teachers/components/TeacherCourseStudentDetail";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseStudentPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();
  const { studentId = "" } = useParams();

  return (
    <TeacherCourseStudentDetail courseId={course.id} studentId={studentId} />
  );
}
