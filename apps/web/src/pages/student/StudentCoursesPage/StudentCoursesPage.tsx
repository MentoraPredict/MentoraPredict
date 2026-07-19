import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import StudentCoursesManagement from "@/features/students/components/StudentCoursesManagement";
import StudentMainSidebar from "@/features/students/components/StudentMainSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

export default function StudentCoursesPage() {
  const { courses, isLoading, error, reload } = useStudentCourses();

  const reloadCourses = async () => (await reload()).data ?? [];

  return (
    <CourseAnalyticsLayout
      title="Panel academico del estudiante"
      sidebar={<StudentMainSidebar courses={courses} />}
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
