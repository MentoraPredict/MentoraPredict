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

import TeacherCoursesPage from "@/pages/teacher/TeacherCoursesPage";

import StudentCoursesPage from "@/pages/student/StudentCoursesPage";

import TeacherCoursePageLayout from "@/features/teachers/components/TeacherCoursePageLayout";
import TeacherCoursePerformancePage from "@/pages/teacher/TeacherCoursePerformancePage";

import TeacherCourseUploadDataPage from "@/pages/teacher/TeacherCourseUploadDataPage";

import TeacherCourseStudentsPage from "@/pages/teacher/TeacherCourseStudentsPage";

import TeacherCourseEditPage from "@/pages/teacher/TeacherCourseEditPage";

import TeacherProfilePage from "@/pages/teacher/TeacherProfilePage";
import StudentProfilePage from "@/pages/student/StudentProfilePage";

import StudentCoursePageLayout from "@/features/students/components/StudentCoursePageLayout";
import StudentCoursePerformancePage from "@/pages/student/StudentCoursePerformancePage";
import StudentCourseUploadDataPage from "@/pages/student/StudentCourseUploadDataPage";

const COURSE_TAB_SEGMENTS = new Set([
  "performance",
  "upload-data",
  "students",
  "edit",
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
              path={APP_PATHS.student.courseDetail}
              element={<StudentCoursePageLayout />}
            >
              <Route path="performance" element={<StudentCoursePerformancePage />} />
              <Route path="upload-data" element={<StudentCourseUploadDataPage />} />
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
              <Route path="upload-data" element={<TeacherCourseUploadDataPage />} />
              <Route path="students" element={<TeacherCourseStudentsPage />} />
              <Route path="edit" element={<TeacherCourseEditPage />} />
            </Route>
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
