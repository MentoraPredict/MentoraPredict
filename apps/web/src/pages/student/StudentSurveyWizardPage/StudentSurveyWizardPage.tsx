import Container from "@/components/atoms/Container";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import SurveyWizard from "@/features/survey/components/SurveyWizard";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentSurveyWizardPage() {
  const { courses } = useStudentCourses();

  return (
    <CourseAnalyticsLayout
      title="Encuesta"
      sidebar={<StudentMainSidebar courses={courses} />}
    >
      <section className="py-2">
        <Container>
          <SurveyWizard />
        </Container>
      </section>
    </CourseAnalyticsLayout>
  );
}
