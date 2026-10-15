import { useOutletContext } from "react-router-dom";

import StudentCourseActivities from "@/features/students/components/StudentCourseActivities";
import type { StudentCoursePageContext } from "@/features/students/components/StudentCoursePageLayout";

export default function StudentCourseActivitiesPage() {
  const { course } = useOutletContext<StudentCoursePageContext>();

  return <StudentCourseActivities courseId={course.id} />;
}
