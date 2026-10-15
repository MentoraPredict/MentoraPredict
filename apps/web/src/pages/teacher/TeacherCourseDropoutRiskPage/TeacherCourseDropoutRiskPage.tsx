import { useOutletContext } from "react-router-dom";

import TeacherCourseDropoutRisk from "@/features/teachers/components/TeacherCourseDropoutRisk";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseDropoutRiskPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return <TeacherCourseDropoutRisk courseId={course.id} />;
}
