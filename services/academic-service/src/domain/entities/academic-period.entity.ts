export type PeriodType = "SEMESTER" | "QUARTER";

export class AcademicPeriodEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public isActive: boolean,
    public type: PeriodType,
  ) {}
}
