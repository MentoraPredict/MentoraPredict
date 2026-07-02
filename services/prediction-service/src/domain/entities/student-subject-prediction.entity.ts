export type PredictionStatus = 'COMPUTED' | 'INSUFFICIENT_DATA';
export type PredictedRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class StudentSubjectPredictionEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly periodId: string,
    public readonly academicWeek: number,
    public readonly academicYear: number,
    public readonly status: PredictionStatus,
    // Interpreted from analytics-service's own ClassifyRiskUseCase output —
    // never reclassified here. null only when status === 'INSUFFICIENT_DATA'.
    public readonly predictedRiskLevel: PredictedRiskLevel | null,
    // Copied verbatim from student_subject_metrics (Fase 7) — not recomputed.
    public readonly trendSlope: number | null,
    public readonly recommendation: string | null,
    public readonly computedAt: Date,
  ) {}
}
