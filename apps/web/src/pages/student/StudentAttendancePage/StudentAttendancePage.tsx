import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import StudentAttendanceReport from "@/features/students/components/StudentAttendanceReport";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";
import { useAuthStore } from "@/store/auth.store";

export default function StudentAttendancePage() {
  const { courses } = useStudentCourses();
  const studentId = useAuthStore((state) => state.user?.id);

  return (
    <CourseAnalyticsLayout
      title="Mi asistencia"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <StudentAttendanceReport studentId={studentId} />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
