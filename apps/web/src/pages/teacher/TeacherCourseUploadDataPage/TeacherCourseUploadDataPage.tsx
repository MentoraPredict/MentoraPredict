import { useParams } from "react-router-dom";

import TeacherCourseUploadData from "@/features/teachers/components/TeacherCourseUploadData";
import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseUploadDataPage() {
  const { courseId } = useParams();

  return (
    <TeacherCoursePageLayout courseId={courseId}>
      <TeacherCourseUploadData />
    </TeacherCoursePageLayout>
  );
}
