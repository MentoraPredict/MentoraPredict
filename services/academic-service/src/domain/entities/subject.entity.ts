export class SubjectEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public credits: number,
    public readonly careerId: string,
    public readonly academicPeriodId: string,
    public maxCapacity: number,
    public teacherId: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  assignTeacher(teacherId: string): void {
    this.teacherId = teacherId;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
