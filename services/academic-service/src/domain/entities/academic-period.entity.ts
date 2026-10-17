export type PeriodStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
export type PeriodType = 'SEMESTER' | 'QUARTER' | 'TRIMESTER' | 'QUIMESTER';

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
    public schoolYearId: string | null = null,
    public number: number | null = null,
    public gradesDueDate: string | null = null,
    public closedAt: Date | null = null,
    public closedBy: string | null = null,
  ) {}

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /** Un periodo cerrado ya no admite cambios de notas. */
  get isClosed(): boolean {
    return this.closedAt !== null;
  }

  close(userId: string): void {
    this.closedAt = new Date();
    this.closedBy = userId;
    this.updatedAt = new Date();
  }

  reopen(): void {
    this.closedAt = null;
    this.closedBy = null;
    this.updatedAt = new Date();
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
