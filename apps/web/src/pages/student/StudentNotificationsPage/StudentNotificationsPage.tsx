import { FiBell } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import ComingSoonSection from "@/features/students/components/ComingSoonSection";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentNotificationsPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Notificaciones"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <ComingSoonSection
            icon={FiBell}
            title="Notificaciones"
            description="Aquí recibirás avisos sobre tus materias, encuestas pendientes y alertas académicas."
          />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
