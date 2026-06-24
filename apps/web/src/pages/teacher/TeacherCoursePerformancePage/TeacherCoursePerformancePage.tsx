import { useParams } from "react-router-dom";

import TeacherCoursePerformance from "@/features/teachers/components/TeacherCoursePerformance";
import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCoursePerformancePage() {
  const { courseId } = useParams();

  return (
    <TeacherCoursePageLayout courseId={courseId}>
      <TeacherCoursePerformance />
    </TeacherCoursePageLayout>
  );
}
