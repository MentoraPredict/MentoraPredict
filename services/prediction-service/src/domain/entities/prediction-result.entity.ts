export interface RiskSnapshot {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  globalAverage: number;
  complianceIndex: number;
  attendance: number;
  failedEvaluations: number;
  trendSlope: number;
}

export interface RecommendationItem {
  type: 'STUDY_HABIT' | 'TUTORING' | 'TIME_MANAGEMENT' | 'ATTENDANCE' | 'SUBJECT_FOCUS' | 'WELLBEING';
  title: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class PredictionResult {
  constructor(
    public readonly studentId: string,
    public readonly periodId: string,
    public readonly risk: RiskSnapshot,
    public readonly summary: string,
    public readonly recommendations: RecommendationItem[],
    public readonly modelVersion: string,
    public readonly generatedAt: Date,
  ) {}
}
