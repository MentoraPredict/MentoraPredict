export type PeriodStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
export type PeriodType = 'SEMESTER' | 'QUARTER';

export class AcademicPeriodEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public description: string,
    public startDate: Date,
    public endDate: Date,
    public status: PeriodStatus,
    public type: PeriodType,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  finish(): void {
    this.status = 'FINISHED';
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }

  plan(): void {
    this.status = 'PLANNED';
    this.updatedAt = new Date();
  }
}
