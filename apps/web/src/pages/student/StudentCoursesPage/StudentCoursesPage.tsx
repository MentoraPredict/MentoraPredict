import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCoursesManagement from "@/features/students/components/StudentCoursesManagement";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";

export default function StudentCoursesPage() {
  const { courses, isLoading, error, reload } = useStudentCourses();
  const activeCourseId = courses[0]?.id ?? "";

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
        reload={reload}
      />
    </CourseAnalyticsLayout>
  );
}
