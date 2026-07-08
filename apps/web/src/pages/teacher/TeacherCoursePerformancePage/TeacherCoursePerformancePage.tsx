import { useOutletContext } from "react-router-dom";

import TeacherCoursePerformance from "@/features/teachers/components/TeacherCoursePerformance";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCoursePerformancePage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return <TeacherCoursePerformance courseId={course.id} />;
}
