import { useParams } from "react-router-dom";

import TeacherCourseEdit from "@/features/teachers/components/TeacherCourseEdit";
import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseEditPage() {
  const { courseId } = useParams();

  return (
    <TeacherCoursePageLayout courseId={courseId}>
      {(activeCourse, { updateCourse, updatingCourseId }) => (
        <TeacherCourseEdit
          course={activeCourse}
          isSaving={updatingCourseId === activeCourse.id}
          onSave={(payload) => updateCourse(activeCourse.id, payload)}
        />
      )}
    </TeacherCoursePageLayout>
  );
}
