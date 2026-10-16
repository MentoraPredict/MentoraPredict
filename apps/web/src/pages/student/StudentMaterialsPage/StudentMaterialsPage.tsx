import { FiFolder } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import ComingSoonSection from "@/features/students/components/ComingSoonSection";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentMaterialsPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Materiales"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <ComingSoonSection
            icon={FiFolder}
            title="Materiales de estudio"
            description="Aquí encontrarás los documentos, presentaciones y recursos compartidos por tus docentes."
          />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
