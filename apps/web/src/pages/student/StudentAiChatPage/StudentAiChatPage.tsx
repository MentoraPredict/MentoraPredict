import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import AiChatWorkspace from "@/features/aiChat/components/AiChatWorkspace";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentAiChatPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Charlas con IA"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <AiChatWorkspace />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
