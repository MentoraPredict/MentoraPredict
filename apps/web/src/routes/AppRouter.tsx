import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleRedirect from "./RoleRedirect";
import { APP_PATHS } from "./paths";
import { useAuthStore } from "@/store/auth.store";

import AdminCoursesPage from "@/pages/admin/AdminCoursesPage";
import AdminSchoolYearsPage from "@/pages/admin/AdminSchoolYearsPage";
import AdminInstitutionConfigPage from "@/pages/admin/AdminInstitutionConfigPage";
import AdminStructurePage from "@/pages/admin/AdminStructurePage";
import AdminSubjectsPage from "@/pages/admin/AdminSubjectsPage";
import AdminEnrollmentsPage from "@/pages/admin/AdminEnrollmentsPage";
import AdminStudentsPage from "@/pages/admin/AdminStudentsPage";
import AdminGradingPeriodsPage from "@/pages/admin/AdminGradingPeriodsPage";
import AdminPromotionPage from "@/pages/admin/AdminPromotionPage";
import GuardianStudentsPage from "@/pages/guardian/GuardianStudentsPage";
import GuardianProfilePage from "@/pages/guardian/GuardianProfilePage";
import GuardianStudentResultsPage from "@/pages/guardian/GuardianStudentResultsPage";
import AdminCourseStudentsPage from "@/pages/admin/AdminCourseStudentsPage";
import AdminProfilePage from "@/pages/admin/AdminProfilePage";

import TeacherCoursesPage from "@/pages/teacher/TeacherCoursesPage";

import StudentCoursesPage from "@/pages/student/StudentCoursesPage";
import StudentSurveyPage from "@/pages/student/StudentSurveyPage";
import StudentSurveyWizardPage from "@/pages/student/StudentSurveyWizardPage";
import StudentCalendarPage from "@/pages/student/StudentCalendarPage";
import StudentTasksPage from "@/pages/student/StudentTasksPage";
import StudentMaterialsPage from "@/pages/student/StudentMaterialsPage";
import StudentEvaluationsPage from "@/pages/student/StudentEvaluationsPage";
import StudentProgressPage from "@/pages/student/StudentProgressPage";
import StudentNotificationsPage from "@/pages/student/StudentNotificationsPage";
import StudentAiChatPage from "@/pages/student/StudentAiChatPage";

import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";
import TeacherCoursePerformancePage from "@/pages/teacher/TeacherCoursePerformancePage";

import TeacherCourseUploadDataPage from "@/pages/teacher/TeacherCourseUploadDataPage";
import TeacherCourseGradebookPage from "@/pages/teacher/TeacherCourseGradebookPage";
import TeacherCourseAttendancePage from "@/pages/teacher/TeacherCourseAttendancePage";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import GuardianStudentAttendancePage from "@/pages/guardian/GuardianStudentAttendancePage";
import AdminAttendancePage from "@/pages/admin/AdminAttendancePage";
import AdminJustificationsPage from "@/pages/admin/AdminJustificationsPage";

import TeacherCourseStudentsPage from "@/pages/teacher/TeacherCourseStudentsPage";

import TeacherCourseDropoutRiskPage from "@/pages/teacher/TeacherCourseDropoutRiskPage";

import TeacherCourseEditPage from "@/pages/teacher/TeacherCourseEditPage";

import TeacherProfilePage from "@/pages/teacher/TeacherProfilePage";
import StudentProfilePage from "@/pages/student/StudentProfilePage";

import StudentCoursePageLayout from "@/features/students/components/StudentCoursePageLayout";
import StudentCourseActivitiesPage from "@/pages/student/StudentCourseActivitiesPage";
import StudentCourseAiChatPage from "@/pages/student/StudentCourseAiChatPage";
import StudentCourseEvaluationsPage from "@/pages/student/StudentCourseEvaluationsPage";
import StudentCoursePerformancePage from "@/pages/student/StudentCoursePerformancePage";
import StudentCourseSurveyPage from "@/pages/student/StudentCourseSurveyPage";
import StudentCourseUploadDataPage from "@/pages/student/StudentCourseUploadDataPage";

const COURSE_TAB_SEGMENTS = new Set([
  "performance",
  "upload-data",
  "activities",
  "evaluations",
  "ai-chat",
  "students",
  "edit",
  "dropout-risk",
  "gradebook",
  "attendance",
]);

function getAnimationKey(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (lastSegment && COURSE_TAB_SEGMENTS.has(lastSegment)) {
    segments.pop();
  }

  return segments.join("/");
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={getAnimationKey(location.pathname)}
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path={APP_PATHS.public.landing} element={<LandingPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path={APP_PATHS.public.login} element={<LoginPage />} />
            <Route
              path={APP_PATHS.public.register}
              element={<RegisterPage />}
            />
            <Route
              path={APP_PATHS.public.forgotPassword}
              element={<ForgotPasswordPage />}
            />
            <Route
              path={APP_PATHS.public.resetPassword}
              element={<ResetPasswordPage />}
            />
          </Route>

          <Route path={APP_PATHS.shared.redirect} element={<RoleRedirect />} />
          <Route
            path={APP_PATHS.public.oauthCallback}
            element={<OAuthCallbackPage />}
          />

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route
              path={APP_PATHS.student.courses}
              element={<StudentCoursesPage />}
            />
            <Route
              path={APP_PATHS.student.profile}
              element={<StudentProfilePage />}
            />
            <Route
              path={APP_PATHS.student.survey}
              element={<StudentSurveyPage />}
            />
            <Route
              path={APP_PATHS.student.surveyWizard}
              element={<StudentSurveyWizardPage />}
            />
            <Route
              path={APP_PATHS.student.aiChat}
              element={<StudentAiChatPage />}
            />
            <Route
              path={APP_PATHS.student.calendar}
              element={<StudentCalendarPage />}
            />
            <Route
              path={APP_PATHS.student.tasks}
              element={<StudentTasksPage />}
            />
            <Route
              path={APP_PATHS.student.materials}
              element={<StudentMaterialsPage />}
            />
            <Route
              path={APP_PATHS.student.evaluations}
              element={<StudentEvaluationsPage />}
            />
            <Route
              path={APP_PATHS.student.attendance}
              element={<StudentAttendancePage />}
            />
            <Route
              path={APP_PATHS.student.progress}
              element={<StudentProgressPage />}
            />
            <Route
              path={APP_PATHS.student.notifications}
              element={<StudentNotificationsPage />}
            />
            <Route
              path={APP_PATHS.student.courseDetail}
              element={<StudentCoursePageLayout />}
            >
              <Route path="performance" element={<StudentCoursePerformancePage />} />
              <Route path="upload-data" element={<StudentCourseUploadDataPage />} />
              <Route path="activities" element={<StudentCourseActivitiesPage />} />
              <Route path="evaluations" element={<StudentCourseEvaluationsPage />} />
              <Route path="ai-chat" element={<StudentCourseAiChatPage />} />
              <Route path="survey/:surveyId" element={<StudentCourseSurveyPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route
              path={APP_PATHS.teacher.courses}
              element={<TeacherCoursesPage />}
            />
            <Route
              path={APP_PATHS.teacher.profile}
              element={<TeacherProfilePage />}
            />
            <Route
              path={APP_PATHS.teacher.courseDetail}
              element={<TeacherCoursePageLayout />}
            >
              <Route path="performance" element={<TeacherCoursePerformancePage />} />
              <Route path="gradebook" element={<TeacherCourseGradebookPage />} />
              <Route path="attendance" element={<TeacherCourseAttendancePage />} />
              <Route path="upload-data" element={<TeacherCourseUploadDataPage />} />
              <Route path="students" element={<TeacherCourseStudentsPage />} />
              <Route path="dropout-risk" element={<TeacherCourseDropoutRiskPage />} />
              <Route path="edit" element={<TeacherCourseEditPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "INSPECTOR", "DECE"]} />}>
            <Route
              path={APP_PATHS.admin.attendance}
              element={<AdminAttendancePage />}
            />
            <Route
              path={APP_PATHS.admin.justifications}
              element={<AdminJustificationsPage />}
            />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SECRETARY", "INSPECTOR", "DECE"]} />
            }
          >
            <Route path={APP_PATHS.admin.profile} element={<AdminProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SECRETARY"]} />}>
            <Route
              path={APP_PATHS.admin.enrollments}
              element={<AdminEnrollmentsPage />}
            />
            <Route
              path={APP_PATHS.admin.students}
              element={<AdminStudentsPage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["GUARDIAN"]} />}>
            <Route
              path={APP_PATHS.guardian.students}
              element={<GuardianStudentsPage />}
            />
            <Route
              path={APP_PATHS.guardian.studentAttendance}
              element={<GuardianStudentAttendancePage />}
            />
            <Route
              path={APP_PATHS.guardian.studentResults}
              element={<GuardianStudentResultsPage />}
            />
            <Route
              path={APP_PATHS.guardian.profile}
              element={<GuardianProfilePage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path={APP_PATHS.admin.dashboard}
              element={<Navigate to={APP_PATHS.admin.users} replace />}
            />
            <Route path={APP_PATHS.admin.users} element={<AdminUsersPage />} />
            <Route
              path={APP_PATHS.admin.courses}
              element={<AdminCoursesPage />}
            />
            <Route
              path={APP_PATHS.admin.courseStudents}
              element={<AdminCourseStudentsPage />}
            />
            <Route
              path={APP_PATHS.admin.schoolYears}
              element={<AdminSchoolYearsPage />}
            />
            <Route
              path={APP_PATHS.admin.institution}
              element={<AdminInstitutionConfigPage />}
            />
            <Route
              path={APP_PATHS.admin.structure}
              element={<AdminStructurePage />}
            />
            <Route
              path={APP_PATHS.admin.subjects}
              element={<AdminSubjectsPage />}
            />
            <Route
              path={APP_PATHS.admin.gradingPeriods}
              element={<AdminGradingPeriodsPage />}
            />
            <Route
              path={APP_PATHS.admin.promotion}
              element={<AdminPromotionPage />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to={APP_PATHS.public.landing} replace />}
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppRouter() {
  useEffect(() => {
    void useAuthStore.getState().hydrateSession();
  }, []);

  const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
