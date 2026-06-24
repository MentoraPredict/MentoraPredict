import { useParams } from "react-router-dom";

import TeacherCourseEdit from "@/features/teachers/components/TeacherCourseEdit";
import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseEditPage() {
  const { courseId } = useParams();

  return (
    <TeacherCoursePageLayout courseId={courseId}>
      {(activeCourse) => <TeacherCourseEdit course={activeCourse} />}
    </TeacherCoursePageLayout>
  );
}
