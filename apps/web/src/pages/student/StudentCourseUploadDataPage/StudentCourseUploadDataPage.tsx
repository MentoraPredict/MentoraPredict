import { useNavigate, useParams } from "react-router-dom";
import { FiBarChart2 } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCourseUploadData from "@/features/students/components/StudentCourseUploadData";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";
import { getStudentCoursePerformancePath } from "@/routes/paths";

export default function StudentCourseUploadDataPage() {
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
      <div className="mb-5 flex flex-wrap gap-3">
        {activeCourse ? (
          <Button
            type="button"
            variant="outline"
            className="gap-2 px-4 py-2 text-sm"
            onClick={() => {
              navigate(getStudentCoursePerformancePath(activeCourse.id));
            }}
          >
            <FiBarChart2 size={16} />
            Ver rendimiento de materia
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <StudentPerformanceUnavailableCard
          title="Cargando materia"
          description="Estamos preparando el formulario de seguimiento semanal."
        />
      ) : error ? (
        <StudentPerformanceUnavailableCard
          title="No se pudo cargar la materia"
          description={error}
        />
      ) : activeCourse ? (
        <StudentCourseUploadData course={activeCourse} />
      ) : (
        <Text variant="small">No se encontro el curso seleccionado.</Text>
      )}
    </CourseAnalyticsLayout>
  );
}
