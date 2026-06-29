import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";

export interface ActiveAcademicPeriod {
  id: string;
  name: string;
  code: string;
  status: "ACTIVE";
}

export interface StudentPerformanceMetrics {
  subjectAverages: Record<string, number>;
  globalAverage: number;
  calculatedAt: string;
}

interface StudentDashboardResponse {
  studentId: string;
  periodId: string;
  metrics: StudentPerformanceMetrics | null;
  generatedAt: string;
}

export async function getActiveAcademicPeriod() {
  const response = await api.get<ActiveAcademicPeriod>(
    endpoints.academic.activePeriod,
  );

  return response.data;
}

export async function getStudentPerformanceDashboard(
  studentId: string,
  periodId: string,
) {
  const response = await api.get<StudentDashboardResponse>(
    endpoints.analytics.studentDashboard(studentId),
    { params: { periodId } },
  );

  return response.data;
}
