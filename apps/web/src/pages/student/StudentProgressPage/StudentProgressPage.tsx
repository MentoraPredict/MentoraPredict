import { FiTrendingUp } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import ComingSoonSection from "@/features/students/components/ComingSoonSection";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentProgressPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Mi Progreso"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <ComingSoonSection
            icon={FiTrendingUp}
            title="Mi progreso"
            description="Aquí verás la evolución de tu rendimiento académico a lo largo del período."
          />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
