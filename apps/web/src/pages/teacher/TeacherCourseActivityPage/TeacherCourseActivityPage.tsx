import { useOutletContext, useParams } from "react-router-dom";

import TeacherCourseActivity from "@/features/teachers/components/TeacherCourseActivity";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseActivityPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();
  const { activityId = "new" } = useParams();

  return <TeacherCourseActivity courseId={course.id} activityId={activityId} />;
}