export class GradeHistoryEntity {
  constructor(
    public readonly id: string,
    public readonly gradeId: string,
    public readonly previousValue: number,
    public readonly newValue: number,
    public readonly changedBy: string,
    public readonly changedAt: Date,
  ) {}
}
