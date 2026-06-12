export type SubjectAverages = Record<string, number>;

export class StudentMetricsEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly periodId: string,
    public subjectAverages: SubjectAverages,
    public globalAverage: number,
    public readonly calculatedAt: Date,
    public version: number,
  ) {}
}
