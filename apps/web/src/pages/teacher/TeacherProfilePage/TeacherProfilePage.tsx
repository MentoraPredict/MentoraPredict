import TeacherTemplate from "@/components/templates/TeacherTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import { useAuthStore } from "@/store/auth.store";

function getTeacherName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ") || undefined;
}

export default function TeacherProfilePage() {
  const user = useAuthStore((state) => state.user);
  const teacherName = getTeacherName(user?.firstName, user?.lastName);
  const { courses, isLoading, error } = useTeacherCourses(
    user?.id,
    teacherName
  );

  return (
    <TeacherTemplate>
      <UserProfileManagement
        role="TEACHER"
        courses={courses}
        isCoursesLoading={isLoading}
        coursesError={error}
      />
    </TeacherTemplate>
  );
}
