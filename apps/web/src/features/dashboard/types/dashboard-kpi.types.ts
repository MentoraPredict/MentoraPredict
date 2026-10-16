import type { RiskLevel } from "@/types/risk";

// Ver docs/frontend/dashboard-kpi-proposal.md §7 — shapes acordados antes de
// implementar. Cada tipo mockeado hoy tiene su contraparte real futura
// documentada ahí (qué endpoint faltaría, o qué campo ya existe pero no se
// expone).

export interface AggregatedRiskSummary {
  level: RiskLevel;
  hasData: boolean;
  worstSubjectId: string | null;
  reason: string;
}

export interface SubjectAttendanceBreakdown {
  subjectId: string;
  sessionsHeld: number;
  sessionsRecordedByTeacher: number;
  attendanceRateTeacher: number | null;
  attendanceRateSelfReport: number;
  effectiveAttendanceRate: number;
  source: "TEACHER" | "STUDENT_SELF_REPORT" | "MIXED" | "NO_SCHEDULE";
}

export interface DashboardAttendanceSummary {
  overallRate: number;
  subjects: SubjectAttendanceBreakdown[];
  unscheduledSubjectsCount: number;
}

export interface ComplianceSummary {
  overallComplianceIndex: number;
  bySubject: { subjectId: string; complianceIndex: number }[];
}

export interface TopicComprehensionPoint {
  topicId: string;
  topicTitle: string;
  order: number;
  comprehension: number;
}

export interface SubjectComprehensionSummary {
  subjectId: string;
  averageComprehension: number;
  weakestTopics: TopicComprehensionPoint[];
  trend: "IMPROVING" | "STABLE" | "WORSENING";
}

export interface ComprehensionSummary {
  overallAverage: number;
  trend: "IMPROVING" | "STABLE" | "WORSENING";
  bySubject: SubjectComprehensionSummary[];
}

export type DropoutRiskFactorKey =
  | "AVERAGE_TREND"
  | "COMPLIANCE_TREND"
  | "SUBJECT_LOAD_TREND"
  | "WITHDRAWALS"
  | "EMOTIONAL_STATE"
  | "ALERT_FREQUENCY"
  | "ENGAGEMENT"
  | "SOCIOECONOMIC";

export interface DropoutRiskFactor {
  key: DropoutRiskFactorKey;
  label: string;
  weight: number;
  normalizedScore: number;
}

export interface DropoutRiskEstimate {
  score: number;
  level: RiskLevel;
  factors: DropoutRiskFactor[];
  isMocked: boolean;
  dataSource: "MOCK_HEURISTIC" | "BACKEND_COMPUTED";
  computedAt: string;
  disclaimer: string | null;
}

export interface EngagementSummary {
  lastLoginAt: string | null;
  daysSinceLastLogin: number | null;
  loginStreakDays: number;
  loginCountLast30Days: number;
  trend: "INCREASING" | "STABLE" | "DECREASING";
}

export interface SurveyStatus {
  surveyCode: string;
  hasResponded: boolean;
  lastSubmittedAt: string | null;
  isStale: boolean;
}

/** Parte real (sin mock) del panel agregado del docente — calculable hoy
 * desde datos que TeacherCoursesManagement ya trae. */
export interface TeacherRealMetrics {
  totalCourses: number;
  totalStudents: number;
  averageAcrossCourses: number | null;
  studentsAtRisk: number;
}

/** Parte mockeada — ver docs/frontend/dashboard-kpi-proposal.md §4. */
export interface TeacherMockedMetrics {
  averageAttendanceAcrossCourses: number;
  coursesWithoutSchedule: number;
  studentsAtDropoutRisk: number;
  courseTrend: "ASCENDING" | "STABLE" | "DESCENDING";
}
