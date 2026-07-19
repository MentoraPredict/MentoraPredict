import { FiCalendar } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import ComingSoonSection from "@/features/students/components/ComingSoonSection";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentCalendarPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Calendario"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <ComingSoonSection
            icon={FiCalendar}
            title="Calendario académico"
            description="Aquí podrás ver fechas de evaluaciones, entregas y eventos importantes de tus materias."
          />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
