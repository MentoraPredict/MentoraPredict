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
    aiChat: "/student/ai-chat",
    calendar: "/student/calendar",
    tasks: "/student/tasks",
    materials: "/student/materials",
    evaluations: "/student/evaluations",
    progress: "/student/progress",
    notifications: "/student/notifications",
    courseDetail: "/student/courses/:courseId",
    coursePerformance: "/student/courses/:courseId/performance",
    courseUploadData: "/student/courses/:courseId/upload-data",
    courseActivities: "/student/courses/:courseId/activities",
    courseEvaluations: "/student/courses/:courseId/evaluations",
    courseAiChat: "/student/courses/:courseId/ai-chat",
    courseSurvey: "/student/courses/:courseId/survey/:surveyId",
  },
  teacher: {
    dashboard: "/teacher/courses",
    courses: "/teacher/courses",
    profile: "/teacher/profile",
    courseDetail: "/teacher/courses/:courseId",
    coursePerformance: "/teacher/courses/:courseId/performance",
    courseUploadData: "/teacher/courses/:courseId/upload-data",
    courseStudents: "/teacher/courses/:courseId/students",
    courseEdit: "/teacher/courses/:courseId/edit",
    courseDropoutRisk: "/teacher/courses/:courseId/dropout-risk",
    courseGradebook: "/teacher/courses/:courseId/gradebook",
  },
  guardian: {
    students: "/guardian/students",
    studentResults: "/guardian/students/:studentId/results",
    profile: "/guardian/profile",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    courses: "/admin/courses",
    schoolYears: "/admin/school-years",
    institution: "/admin/institution",
    structure: "/admin/structure",
    subjects: "/admin/subjects",
    enrollments: "/admin/enrollments",
    students: "/admin/students",
    gradingPeriods: "/admin/grading-periods",
    promotion: "/admin/promotion",
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

export function getTeacherCourseUploadDataPath(courseId: string) {
  return `/teacher/courses/${courseId}/upload-data`;
}

export function getTeacherCourseStudentsPath(courseId: string) {
  return `/teacher/courses/${courseId}/students`;
}

export function getTeacherCourseDropoutRiskPath(courseId: string) {
  return `/teacher/courses/${courseId}/dropout-risk`;
}

export function getTeacherCourseGradebookPath(courseId: string) {
  return `/teacher/courses/${courseId}/gradebook`;
}

export function getGuardianStudentResultsPath(studentId: string) {
  return `/guardian/students/${studentId}/results`;
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

export function getStudentSurveyWizardPath(surveyId: string) {
  return `/student/survey/${surveyId}`;
}

export function getStudentCourseActivitiesPath(courseId: string) {
  return `/student/courses/${courseId}/activities`;
}

export function getStudentCourseEvaluationsPath(courseId: string) {
  return `/student/courses/${courseId}/evaluations`;
}

export function getStudentCourseAiChatPath(courseId: string) {
  return `/student/courses/${courseId}/ai-chat`;
}

export function getStudentCourseSurveyPath(courseId: string, surveyId: string) {
  return `/student/courses/${courseId}/survey/${surveyId}`;
}
