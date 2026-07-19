import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import SurveyCatalogList from "@/features/survey/components/SurveyCatalogList";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentSurveyPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Encuestas"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <SurveyCatalogList />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
