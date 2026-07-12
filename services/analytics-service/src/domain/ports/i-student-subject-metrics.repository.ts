import { StudentSubjectMetricsEntity } from '../entities/student-subject-metrics.entity';

export interface SubjectRiskCounts {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
  unclassified: number;
}

export interface IStudentSubjectMetricsRepository {
  // Atomic upsert on (studentId, subjectId, academicWeek, academicYear) via ON CONFLICT —
  // same pattern as weekly_check_ins in academic-service (Fase 5).
  upsert(metric: StudentSubjectMetricsEntity): Promise<StudentSubjectMetricsEntity>;
  findLatestByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<StudentSubjectMetricsEntity | null>;
  findByStudentSubjectPaginated(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: StudentSubjectMetricsEntity[]; total: number }>;
  // Up to `limit` most recent existing rows (desc by year, week) — used to
  // compute trendSlope and to read the previous week's riskLevel without a
  // second query (Fase 7).
  findRecentByStudentSubject(
    studentId: string,
    subjectId: string,
    limit: number,
  ): Promise<StudentSubjectMetricsEntity[]>;
  // Latest riskLevel per student in the subject, grouped into counts.
  getRiskCountsBySubject(subjectId: string): Promise<SubjectRiskCounts>;
  // Average of each student's latest averageGrade in the subject (course-level average).
  getAverageGradeBySubject(subjectId: string): Promise<number | null>;
}
