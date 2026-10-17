export interface GradingComponent {
  code: string;
  name: string;
  weight: number;
  sortOrder: number;
}

export interface ScaleBand {
  code: string;
  label: string;
  minValue: number;
  maxValue: number;
}

export interface ScaleView {
  minValue: number;
  maxValue: number;
  passingGrade: number;
  decimals: number;
  bands: ScaleBand[];
}

export interface GradeActivity {
  id: string;
  subjectId: string;
  periodId: string;
  componentCode: string;
  name: string;
  dueDate: string | null;
  isActive: boolean;
  gradeCount: number;
}

export interface GradebookStudent {
  studentId: string;
  name: string;
  grades: Record<string, number>;
  componentAverages: Record<string, number | null>;
  periodGrade: number | null;
  bandCode: string | null;
  isComplete: boolean;
}

export interface PeriodSummary {
  id: string;
  name: string;
  number: number | null;
  isClosed: boolean;
}

export interface Gradebook {
  subject: { id: string; name: string; code: string };
  period: PeriodSummary & { gradesDueDate: string | null };
  periods: PeriodSummary[];
  scale: ScaleView;
  components: GradingComponent[];
  activities: GradeActivity[];
  students: GradebookStudent[];
}

export interface GradeEntry {
  studentId: string;
  activityId: string;
  value: number;
}

export interface SaveGradesResult {
  created: number;
  updated: number;
  unchanged: number;
}

export interface ActivityPayload {
  periodId: string;
  componentCode: string;
  name: string;
  dueDate?: string | null;
}

export interface PeriodClosureCourse {
  subjectId: string;
  name: string;
  sectionLabel: string;
  students: number;
  incomplete: number;
}

export interface PeriodClosureEvent {
  id: string;
  action: "CLOSE" | "REOPEN";
  reason: string | null;
  performedBy: string;
  performedByName: string;
  performedAt: string;
}

export interface PeriodClosure {
  period: {
    id: string;
    name: string;
    number: number | null;
    schoolYearId: string | null;
    isClosed: boolean;
    closedAt: string | null;
  };
  events: PeriodClosureEvent[];
  courses: PeriodClosureCourse[];
  totals: { courses: number; students: number; incomplete: number };
}

export type SubjectResultStatus =
  | "APPROVED"
  | "SUPPLEMENTARY_PENDING"
  | "FAILED"
  | "INCOMPLETE";

export type PromotionSuggestion =
  | "PROMOTED"
  | "REPEATS"
  | "REVIEW"
  | "PENDING_SUPPLEMENTARY"
  | "PENDING";

export type PromotionOutcome = "PROMOTED" | "REPEATS";

export interface CoursePeriodCell {
  periodId: string;
  value: number | null;
  isComplete: boolean;
  bandCode: string | null;
  isClosed: boolean;
}

export interface CourseYearResult {
  subjectId: string;
  name: string;
  code: string;
  periods: CoursePeriodCell[];
  annualAverage: number | null;
  supplementaryGrade: number | null;
  finalGrade: number | null;
  status: SubjectResultStatus;
  bandCode: string | null;
}

export interface PromotionDecision {
  studentEnrollmentId: string;
  outcome: PromotionOutcome;
  suggested: PromotionSuggestion;
  isOverride: boolean;
  notes: string | null;
  decidedAt: string;
}

export interface StudentResults {
  studentId: string;
  studentName: string;
  schoolYear: { id: string; name: string };
  enrollment: {
    id: string;
    sectionId: string;
    sectionLabel: string;
    status: string;
  };
  scale: ScaleView;
  result: {
    enrollmentId: string;
    periods: PeriodSummary[];
    courses: CourseYearResult[];
    suggestion: PromotionSuggestion;
    reasons: string[];
  };
  decision: PromotionDecision | null;
}

export interface SupplementaryCandidate {
  studentId: string;
  studentName: string;
  annualAverage: number;
  supplementaryGrade: number | null;
  status: SubjectResultStatus;
}

export interface SectionPromotionRow {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  enrollmentStatus: string;
  suggestion: PromotionSuggestion;
  reasons: string[];
  courses: Array<
    Pick<
      CourseYearResult,
      | "subjectId"
      | "name"
      | "annualAverage"
      | "supplementaryGrade"
      | "finalGrade"
      | "status"
    >
  >;
  decision: PromotionDecision | null;
}

export interface PromotionDecisionPayload {
  studentEnrollmentId: string;
  outcome: PromotionOutcome;
  notes?: string | null;
}

export interface PromotionConfirmResult {
  studentEnrollmentId: string;
  ok: boolean;
  errors: string[];
}

export const SUBJECT_STATUS_LABELS: Record<SubjectResultStatus, string> = {
  APPROVED: "Aprobada",
  SUPPLEMENTARY_PENDING: "Supletorio pendiente",
  FAILED: "Reprobada",
  INCOMPLETE: "Incompleta",
};

export const SUGGESTION_LABELS: Record<PromotionSuggestion, string> = {
  PROMOTED: "Promovido",
  REPEATS: "Repite",
  REVIEW: "Requiere revisión",
  PENDING_SUPPLEMENTARY: "Supletorio pendiente",
  PENDING: "Pendiente",
};

export const OUTCOME_LABELS: Record<PromotionOutcome, string> = {
  PROMOTED: "Promovido",
  REPEATS: "Repite el año",
};
