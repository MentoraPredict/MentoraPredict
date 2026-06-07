export type EnrollmentStatus = 'ACTIVE' | 'WITHDRAWN' | 'COMPLETED';

export class EnrollmentEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public status: EnrollmentStatus,
    public readonly enrolledAt: Date,
    public readonly createdAt: Date,
  ) {}

  withdraw(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Only active enrollments can be withdrawn');
    }
    this.status = 'WITHDRAWN';
  }

  complete(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Only active enrollments can be completed');
    }
    this.status = 'COMPLETED';
  }
}
