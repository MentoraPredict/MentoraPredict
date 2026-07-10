export type SubjectRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class StudentSubjectMetricsEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly periodId: string,
    public readonly academicWeek: number,
    public readonly academicYear: number,
    // null means "not enough data yet", never a fabricated neutral value:
    // averageGrade null = no graded evaluations yet for this subject.
    // complianceIndex/attendanceRate/studyHours/comprehensionAvg null = no
    // check-in submitted for this week yet (these four are always null
    // together, since they all come from the same WeeklyCheckIn record).
    public readonly averageGrade: number | null,
    public readonly complianceIndex: number | null,
    public readonly attendanceRate: number | null,
    public readonly studyHours: number | null,
    public readonly comprehensionAvg: number | null,
    // null = insufficient data to classify (missing check-in and/or grade),
    // a distinct state from any of LOW/MEDIUM/HIGH/CRITICAL.
    public readonly riskLevel: SubjectRiskLevel | null,
    // null = fewer than 2 weeks of graded history available yet (Fase 7).
    public readonly trendSlope: number | null,
    public readonly computedAt: Date,
  ) {}
}
