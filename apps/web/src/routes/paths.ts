import type { UserRole } from "@/types/user/role.types";

export const APP_PATHS = {
  public: {
    landing: "/",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    oauthCallback: "/auth/callback",
  },
  shared: {
    redirect: "/redirect",
  },
  student: {
    dashboard: "/student/courses",
    courses: "/student/courses",
    profile: "/student/profile",
    survey: "/student/survey",
    surveyWizard: "/student/survey/:surveyId",
    progress: "/student/progress",
    attendance: "/student/attendance",
    notifications: "/student/notifications",
    courseDetail: "/student/courses/:courseId",
    coursePerformance: "/student/courses/:courseId/performance",
    courseUploadData: "/student/courses/:courseId/upload-data",
    courseActivities: "/student/courses/:courseId/activities",
    courseEvaluations: "/student/courses/:courseId/evaluations",
    courseMaterials: "/student/courses/:courseId/materials",
    courseAiChat: "/student/courses/:courseId/ai-chat",
  },
  teacher: {
    dashboard: "/teacher/courses",
    courses: "/teacher/courses",
    profile: "/teacher/profile",
    courseDetail: "/teacher/courses/:courseId",
    coursePerformance: "/teacher/courses/:courseId/performance",
    courseSyllabus: "/teacher/courses/:courseId/syllabus",
    courseDropoutRisk: "/teacher/courses/:courseId/dropout-risk",
    courseStudents: "/teacher/courses/:courseId/students",
    courseStudentDetail: "/teacher/courses/:courseId/students/:studentId",
    courseEdit: "/teacher/courses/:courseId/edit",
    courseGradebook: "/teacher/courses/:courseId/gradebook",
    courseActivity: "/teacher/courses/:courseId/gradebook/activities/:activityId",
    courseAttendance: "/teacher/courses/:courseId/attendance",
  },
  guardian: {
    students: "/guardian/students",
    studentResults: "/guardian/students/:studentId/results",
    studentAttendance: "/guardian/students/:studentId/attendance",
    profile: "/guardian/profile",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    userDetail: "/admin/users/:userId",
    courses: "/admin/courses",
    schoolYears: "/admin/school-years",
    institution: "/admin/institution",
    structure: "/admin/structure",
    subjects: "/admin/subjects",
    enrollments: "/admin/enrollments",
    gradingPeriods: "/admin/grading-periods",
    promotion: "/admin/promotion",
    alerts: "/admin/alerts",
    ai: "/admin/ai",
    justifications: "/admin/justifications",
    profile: "/admin/profile",
    courseStudents: "/admin/courses/:courseId/students",
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
    case "SECRETARY":
      return APP_PATHS.admin.enrollments;
    case "DECE":
    case "INSPECTOR":
      return APP_PATHS.admin.alerts;
    case "GUARDIAN":
      return APP_PATHS.guardian.students;
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

export function getTeacherCourseDropoutRiskPath(courseId: string) {
  return `/teacher/courses/${courseId}/dropout-risk`;
}

export function getTeacherCourseSyllabusPath(courseId: string) {
  return `/teacher/courses/${courseId}/syllabus`;
}

export function getTeacherCourseStudentsPath(courseId: string) {
  return `/teacher/courses/${courseId}/students`;
}

export function getTeacherCourseStudentDetailPath(
  courseId: string,
  studentId: string,
) {
  return `/teacher/courses/${courseId}/students/${studentId}`;
}

export function getTeacherCourseGradebookPath(courseId: string) {
  return `/teacher/courses/${courseId}/gradebook`;
}

export function getTeacherCourseActivityPath(
  courseId: string,
  activityId: string,
  options: { periodId?: string; componentCode?: string } = {},
) {
  const params = new URLSearchParams();
  if (options.periodId) params.set("period", options.periodId);
  if (options.componentCode) params.set("component", options.componentCode);
  const query = params.toString();

  return `/teacher/courses/${courseId}/gradebook/activities/${activityId}${query ? `?${query}` : ""}`;
}

export function getTeacherCourseAttendancePath(courseId: string) {
  return `/teacher/courses/${courseId}/attendance`;
}

export function getGuardianStudentAttendancePath(studentId: string) {
  return `/guardian/students/${studentId}/attendance`;
}

export function getGuardianStudentResultsPath(studentId: string) {
  return `/guardian/students/${studentId}/results`;
}

export function getAdminUserEditPath(userId: string) {
  return `/admin/users/${userId}`;
}

export function getAdminCourseStudentsPath(courseId: string) {
  return `/admin/courses/${courseId}/students`;
}

export function getTeacherCourseEditPath(courseId: string) {
  return `/teacher/courses/${courseId}/edit`;
}

export function getStudentCourseUploadDataPath(courseId: string) {
  return `/student/courses/${courseId}/upload-data`;
}

export function getStudentCourseActivitiesPath(courseId: string) {
  return `/student/courses/${courseId}/activities`;
}

export function getStudentCourseEvaluationsPath(courseId: string) {
  return `/student/courses/${courseId}/evaluations`;
}

export function getStudentCourseMaterialsPath(courseId: string) {
  return `/student/courses/${courseId}/materials`;
}

export function getStudentCourseAiChatPath(courseId: string) {
  return `/student/courses/${courseId}/ai-chat`;
}

export function getStudentSurveyWizardPath(surveyId: string) {
  return `/student/survey/${surveyId}`;
}
