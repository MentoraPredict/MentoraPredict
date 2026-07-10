import { useOutletContext } from "react-router-dom";

import TeacherCourseUploadData from "@/features/teachers/components/TeacherCourseUploadData";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseUploadDataPage() {
  const { course } = useOutletContext<TeacherCoursePageContext>();

  return <TeacherCourseUploadData courseId={course.id} />;
}
