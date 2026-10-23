import { useOutletContext } from "react-router-dom";

import TeacherCourseGradebook from "@/features/teachers/components/TeacherCourseGradebook";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseGradebookPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return <TeacherCourseGradebook courseId={course.id} />;
}
