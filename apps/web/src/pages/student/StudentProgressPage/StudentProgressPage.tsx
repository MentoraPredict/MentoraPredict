import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import StudentResultsReport from "@/features/students/components/StudentResultsReport";
import useStudentCourses from "@/hooks/queries/useStudentCourses";
import { useAuthStore } from "@/store/auth.store";

export default function StudentProgressPage() {
  const { courses } = useStudentCourses();
  const studentId = useAuthStore((state) => state.user?.id);

  return (
    <CourseAnalyticsLayout
      title="Mis calificaciones"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <StudentResultsReport studentId={studentId} />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
