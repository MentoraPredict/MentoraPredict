import { useOutletContext } from "react-router-dom";

import TeacherCourseStudents from "@/features/teachers/components/TeacherCourseStudents";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseStudentsPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return <TeacherCourseStudents courseId={course.id} />;
}
