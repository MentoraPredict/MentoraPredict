import { useOutletContext } from "react-router-dom";

import StudentCourseUploadData from "@/features/students/components/StudentCourseUploadData";
import type { StudentCoursePageContext } from "@/features/students/components/StudentCoursePageLayout";

export default function StudentCourseUploadDataPage() {
  const { course } = useOutletContext<StudentCoursePageContext>();

  return <StudentCourseUploadData course={course} />;
}
