import { useOutletContext } from "react-router-dom";

import StudentCoursePerformance from "@/features/students/components/StudentCoursePerformance";
import type { StudentCoursePageContext } from "@/features/students/components/StudentCoursePageLayout";

export default function StudentCoursePerformancePage() {
  const { course } = useOutletContext<StudentCoursePageContext>();

  return <StudentCoursePerformance courseId={course.id} course={course} />;
}
