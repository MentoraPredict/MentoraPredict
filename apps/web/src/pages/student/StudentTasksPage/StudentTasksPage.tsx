import { FiCheckSquare } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import ComingSoonSection from "@/features/students/components/ComingSoonSection";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentTasksPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Tareas"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <ComingSoonSection
            icon={FiCheckSquare}
            title="Tareas"
            description="Aquí podrás ver y entregar las tareas asignadas en cada una de tus materias."
          />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
