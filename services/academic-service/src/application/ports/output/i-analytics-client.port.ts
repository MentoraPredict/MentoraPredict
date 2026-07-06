export interface LatestSubjectMetric {
  averageGrade: number | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
}

export interface IAnalyticsClientPort {
  triggerRecalculate(subjectId: string, periodId: string, studentIds: string[]): Promise<void>;
  getLatestSubjectMetric(studentId: string, subjectId: string): Promise<LatestSubjectMetric | null>;
}
