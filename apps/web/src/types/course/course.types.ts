export type CourseRiskLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface Course {
  id: string;
  name: string;
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
