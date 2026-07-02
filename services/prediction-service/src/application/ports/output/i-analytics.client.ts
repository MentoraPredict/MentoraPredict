import { RiskSnapshot } from '../../../domain/entities/prediction-result.entity';

export interface LatestSubjectMetric {
  averageGrade: number | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  trendSlope: number | null;
  complianceIndex: number | null;
  attendanceRate: number | null;
  studyHours: number | null;
  comprehensionAvg: number | null;
  computedAt: string;
}

export interface IAnalyticsClient {
  getRiskSnapshot(studentId: string, periodId: string): Promise<RiskSnapshot>;
  getLatestSubjectMetric(studentId: string, subjectId: string): Promise<LatestSubjectMetric | null>;
}
