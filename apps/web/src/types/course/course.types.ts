export type CourseRiskLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface Course {
  id: string;
  name: string;
  teacherName: string;
  semester: string;
  description: string;
  riskLevel: CourseRiskLevel;
  imageUrl?: string;
  riskLabel?: string;
}
