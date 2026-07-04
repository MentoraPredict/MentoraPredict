import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCoursePerformance from "@/features/students/components/StudentCoursePerformance";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";
import { APP_PATHS } from "@/routes/paths";

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
      <div className="mb-5">
        <Button
          type="button"
          variant="outline"
          className="gap-2 px-4 py-2 text-sm"
          onClick={() => {
            navigate(APP_PATHS.student.dashboard);
          }}
        >
          <FiArrowLeft size={16} />
          Regresar al panel
        </Button>
      </div>

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
        />
      ) : (
        <Text variant="small">No se encontro el curso seleccionado.</Text>
      )}
    </CourseAnalyticsLayout>
  );
}
