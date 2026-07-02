import { useParams } from "react-router-dom";

import Text from "@/components/atoms/Text";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCourseUploadData from "@/features/students/components/StudentCourseUploadData";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";
import { useAuthStore } from "@/store/auth.store";

export default function StudentCourseUploadDataPage() {
  const { courseId } = useParams();
  const user = useAuthStore((state) => state.user);
  const { courses, isLoading, error } = useStudentCourses(user?.id);
  const activeCourse =
    courses.find((course) => course.id === courseId) ?? courses[0] ?? null;
  const activeCourseId = activeCourse?.id ?? courseId ?? "";

  return (
    <CourseAnalyticsLayout
      title={activeCourse ? `${activeCourse.name} - Estudiante` : "Curso - Estudiante"}
      sidebar={
        <CourseSidebar
          mode="student"
          courses={courses}
          activeCourseId={activeCourseId}
        />
      }
    >
      {isLoading ? (
        <Text variant="small">Cargando curso...</Text>
      ) : error ? (
        <Text variant="small" className="text-red-700">
          {error}
        </Text>
      ) : activeCourse ? (
        <StudentCourseUploadData />
      ) : (
        <Text variant="small">No se encontro el curso seleccionado.</Text>
      )}
    </CourseAnalyticsLayout>
  );
}
