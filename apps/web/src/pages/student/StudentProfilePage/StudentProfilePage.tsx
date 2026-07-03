import StudentTemplate from "@/components/templates/StudentTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";
import { useAuthStore } from "@/store/auth.store";

export default function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const { courses, isLoading, error } = useStudentCourses(user?.id);

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
