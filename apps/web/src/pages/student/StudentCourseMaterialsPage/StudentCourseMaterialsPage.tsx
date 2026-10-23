import { useOutletContext } from "react-router-dom";

import StudentCourseMaterials from "@/features/students/components/StudentCourseMaterials";
import type { StudentCoursePageContext } from "@/features/students/components/StudentCoursePageLayout";

export default function StudentCourseMaterialsPage() {
  const { course } = useOutletContext<StudentCoursePageContext>();

  return <StudentCourseMaterials course={course} />;
}
