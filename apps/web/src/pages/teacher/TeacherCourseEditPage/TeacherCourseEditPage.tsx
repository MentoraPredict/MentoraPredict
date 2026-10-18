import { useOutletContext } from "react-router-dom";

import SyllabusTopicsPanel from "@/features/teachers/components/SyllabusTopicsPanel";
import TeacherCourseEdit from "@/features/teachers/components/TeacherCourseEdit";
import type { TeacherCoursePageContext } from "@/features/teachers/components/TeacherCoursePageLayout";

export default function TeacherCourseEditPage() {
  const {
    course,
    actions: { updateCourse, updatingCourseId, uploadCourseImage, removeCourseImage },
  } = useOutletContext<TeacherCoursePageContext>();

  return (
    <div className="space-y-6">
      <TeacherCourseEdit
        course={course}
        isSaving={updatingCourseId === course.id}
        onSave={(payload) => updateCourse(course.id, payload)}
        onUploadImage={(file) => uploadCourseImage(course.id, file)}
        onDeleteImage={() => removeCourseImage(course.id)}
      />
      <SyllabusTopicsPanel subjectId={course.id} />
    </div>
  );
}
