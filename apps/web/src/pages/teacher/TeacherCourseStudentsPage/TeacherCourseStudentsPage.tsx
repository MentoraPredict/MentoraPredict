import { useParams } from "react-router-dom";

import TeacherCourseStudents from "@/features/teachers/components/TeacherCourseStudents";
import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseStudentsPage() {
  const { courseId } = useParams();

  return (
    <TeacherCoursePageLayout courseId={courseId}>
      {(course) => <TeacherCourseStudents courseId={course.id} />}
    </TeacherCoursePageLayout>
  );
}
