import axios from "axios";
import { useEffect, useState } from "react";

import {
  getActiveAcademicPeriod,
  getStudentPerformanceDashboard,
  type ActiveAcademicPeriod,
  type StudentPerformanceMetrics,
} from "@/services/student-performance.service";
import { useAuthStore } from "@/store/auth.store";

interface StudentCoursePerformanceState {
  period: ActiveAcademicPeriod | null;
  metrics: StudentPerformanceMetrics | null;
  isLoading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) return message.join(". ");
    if (message) return message;
  }

  return "No fue posible cargar el rendimiento académico.";
}

export default function useStudentCoursePerformance(courseId: string) {
  const studentId = useAuthStore((state) => state.user?.id);
  const [state, setState] = useState<StudentCoursePerformanceState>({
    period: null,
    metrics: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadPerformance() {
      if (!studentId) {
        setState({
          period: null,
          metrics: null,
          isLoading: false,
          error: "No se pudo identificar al estudiante autenticado.",
        });
        return;
      }

      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const period = await getActiveAcademicPeriod();
        const dashboard = await getStudentPerformanceDashboard(
          studentId,
          period.id,
        );

        if (!isCancelled) {
          setState({
            period,
            metrics: dashboard.metrics,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({
            period: null,
            metrics: null,
            isLoading: false,
            error: getErrorMessage(error),
          });
        }
      }
    }

    void loadPerformance();

    return () => {
      isCancelled = true;
    };
  }, [studentId, courseId]);

  return {
    ...state,
    subjectAverage: state.metrics?.subjectAverages[courseId] ?? null,
  };
}
