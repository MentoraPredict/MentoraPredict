import type { UserRole } from "@/types/user/role.types";

export const APP_PATHS = {
  public: {
    landing: "/",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
  },
  shared: {
    redirect: "/redirect",
  },
  student: {
    dashboard: "/student/courses",
    courses: "/student/courses",
    coursePerformance: "/student/courses/:courseId/performance",
  },
  teacher: {
    dashboard: "/teacher/courses",
    courses: "/teacher/courses",
    coursePerformance: "/teacher/courses/:courseId/performance",
    courseUploadData: "/teacher/courses/:courseId/upload-data",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    courses: "/admin/courses",
  },
} as const;

export function getDashboardPath(role: UserRole) {
  switch (role) {
    case "STUDENT":
      return APP_PATHS.student.dashboard;
    case "TEACHER":
      return APP_PATHS.teacher.dashboard;
    case "ADMIN":
      return APP_PATHS.admin.users;
    default:
      return APP_PATHS.public.landing;
  }
}

export function getTeacherCoursePerformancePath(courseId: string) {
  return `/teacher/courses/${courseId}/performance`;
}

export function getStudentCoursePerformancePath(courseId: string) {
  return `/student/courses/${courseId}/performance`;
}

export function getTeacherCourseUploadDataPath(courseId: string) {
  return `/teacher/courses/${courseId}/upload-data`;
}
