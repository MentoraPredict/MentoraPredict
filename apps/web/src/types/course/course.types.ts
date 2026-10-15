import type { RiskLevelOrUnknown } from "@/types/risk";

/** @deprecated import `RiskLevelOrUnknown` from `@/types/risk` directly — kept for existing call sites. */
export type CourseRiskLevel = RiskLevelOrUnknown;

export interface Course {
  id: string;
  name: string;
  code?: string;
  teacherId?: string;
  teacherName: string;
  semester: string;
  isActive?: boolean;
  description: string;
  riskLevel: CourseRiskLevel;
  imageUrl?: string;
  riskLabel?: string;
  credits?: number;
  careerId?: string;
  careerName?: string;
  facultyId?: string;
  facultyName?: string;
  currentAverage?: number | null;
  enrolledCount?: number;
  /** Client-only: true while this course is queued for offline sync and hasn't reached the server yet. */
  isPendingSync?: boolean;
}
