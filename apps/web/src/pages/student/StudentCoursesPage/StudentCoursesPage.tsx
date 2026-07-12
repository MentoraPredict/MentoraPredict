import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCoursesManagement from "@/features/students/components/StudentCoursesManagement";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentCoursesPage() {
  const { courses, isLoading, error, reload } = useStudentCourses();
  const activeCourseId = courses[0]?.id ?? "";

  const reloadCourses = async () => (await reload()).data ?? [];

  return (
    <CourseAnalyticsLayout
      title="Panel academico del estudiante"
      sidebar={
        <CourseSidebar
          mode="student"
          courses={courses}
          activeCourseId={activeCourseId}
        />
      }
    >
      <StudentCoursesManagement
        courses={courses}
        isLoading={isLoading}
        error={error}
        reload={reloadCourses}
      />
    </CourseAnalyticsLayout>
  );
}
