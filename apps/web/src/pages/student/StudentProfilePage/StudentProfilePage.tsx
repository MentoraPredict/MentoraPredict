import StudentTemplate from "@/components/templates/StudentTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";

export default function StudentProfilePage() {
  const { courses, isLoading, error } = useStudentCourses();

  return (
    <StudentTemplate>
      <UserProfileManagement
        role="STUDENT"
        courses={courses}
        isCoursesLoading={isLoading}
        coursesError={error}
      />
    </StudentTemplate>
  );
}
