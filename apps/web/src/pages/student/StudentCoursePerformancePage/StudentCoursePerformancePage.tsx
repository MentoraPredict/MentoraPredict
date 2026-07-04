import { useNavigate, useParams } from "react-router-dom";

import Text from "@/components/atoms/Text";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCoursePerformance from "@/features/students/components/StudentCoursePerformance";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";
import { getStudentCourseUploadDataPath } from "@/routes/paths";

export default function StudentCoursePerformancePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { courses, isLoading, error } = useStudentCourses();
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
        <StudentPerformanceUnavailableCard
          title="Cargando rendimiento"
          description="Estamos preparando el panel academico de la materia."
        />
      ) : error ? (
        <StudentPerformanceUnavailableCard
          title="No se pudo cargar la materia"
          description={error}
        />
      ) : activeCourse ? (
        <StudentCoursePerformance
          courseId={activeCourse.id}
          course={activeCourse}
          onRegisterAdvance={() => {
            navigate(getStudentCourseUploadDataPath(activeCourse.id));
          }}
        />
      ) : (
        <Text variant="small">No se encontro el curso seleccionado.</Text>
      )}
    </CourseAnalyticsLayout>
  );
}
