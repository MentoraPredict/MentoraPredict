import { useNavigate } from "react-router-dom";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";
import StudentCoursesEmptyState from "@/features/students/components/StudentCoursesEmptyState";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";

import { getStudentCoursePerformancePath } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";

export default function StudentCoursesManagement() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { courses, isLoading, error } = useStudentCourses(user?.id);

  return (
    <section className="py-8">
      <Container>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-8">
            <Heading as="h3" className="text-gray-900">
              Mis Cursos
            </Heading>

            <Text variant="small" className="mt-2">
              Revisa tu progreso academico y analisis de riesgo en tiempo real.
            </Text>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <Text variant="small" className="font-medium text-red-700">
                {error}
              </Text>
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
              <Text variant="small">Cargando cursos...</Text>
            </div>
          ) : courses.length > 0 ? (
            <CourseGrid
              courses={courses}
              onCourseClick={(courseId) => {
                navigate(getStudentCoursePerformancePath(courseId));
              }}
            />
          ) : (
            <StudentCoursesEmptyState />
          )}
        </div>
      </Container>
    </section>
  );
}
