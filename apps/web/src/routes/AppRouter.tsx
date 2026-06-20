import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import StudentDashboardPage from "@/pages/student/StudentDashboardPage";
import TeacherDashboardPage from "@/pages/teacher/TeacherDashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleRedirect from "./RoleRedirect";
import { APP_PATHS } from "./paths";
import { useAuthStore } from "@/store/auth.store";

export default function AppRouter() {
  useEffect(() => {
    void useAuthStore.getState().hydrateSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_PATHS.public.landing} element={<LandingPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path={APP_PATHS.public.login} element={<LoginPage />} />
          <Route path={APP_PATHS.public.register} element={<RegisterPage />} />
          <Route
            path={APP_PATHS.public.forgotPassword}
            element={<ForgotPasswordPage />}
          />
        </Route>

        <Route path={APP_PATHS.shared.redirect} element={<RoleRedirect />} />

        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route
            path={APP_PATHS.student.dashboard}
            element={<StudentDashboardPage />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
          <Route
            path={APP_PATHS.teacher.dashboard}
            element={<TeacherDashboardPage />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path={APP_PATHS.admin.dashboard}
            element={<Navigate to={APP_PATHS.admin.users} replace />}
          />
          <Route path={APP_PATHS.admin.users} element={<AdminUsersPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={APP_PATHS.public.landing} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
