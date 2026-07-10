import { useMemo } from "react";

import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import TeacherCoursesManagement from "@/features/teachers/components/TeacherCoursesManagement";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import { useAuthStore } from "@/store/auth.store";

function getTeacherDisplayName(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return fullName || user?.email || "Docente";
}

export default function TeacherCoursesPage() {
  const user = useAuthStore((state) => state.user);
  const teacherName = useMemo(() => getTeacherDisplayName(user), [user]);
  const courseState = useTeacherCourses(user?.id, teacherName, true);
  const activeCourseId = courseState.courses[0]?.id ?? "";

  return (
    <CourseAnalyticsLayout
      title="Panel docente"
      sidebar={
        <CourseSidebar
          mode="teacher"
          courses={courseState.courses}
          activeCourseId={activeCourseId}
        />
      }
    >
      <TeacherCoursesManagement
        teacherName={teacherName}
        courseState={courseState}
      />
    </CourseAnalyticsLayout>
  );
}
