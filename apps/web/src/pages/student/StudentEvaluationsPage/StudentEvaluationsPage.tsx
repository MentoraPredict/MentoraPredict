import { FiClipboard } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import ComingSoonSection from "@/features/students/components/ComingSoonSection";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentEvaluationsPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Evaluaciones"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <ComingSoonSection
            icon={FiClipboard}
            title="Evaluaciones"
            description="Aquí podrás ver tus calificaciones y el detalle de cada evaluación por materia."
          />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
