import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";
import useAdminCourses from "@/features/admin/hooks/useAdminCourses";

export default function AdminCoursesManagement() {
  const { courses, isLoading, error } = useAdminCourses();

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6">
          <Heading as="h3" className="text-gray-900">
            Cursos
          </Heading>

          <Text variant="small" className="mt-2 max-w-2xl">
            Visualiza los cursos creados por los docentes dentro de
            MentoraPredict.
          </Text>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-6 py-4">
            <Text variant="small" className="font-medium text-red-700">
              {error}
            </Text>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <Text variant="small">Cargando cursos...</Text>
          </div>
        ) : (
          <CourseGrid courses={courses} />
        )}
      </Container>
    </section>
  );
}
