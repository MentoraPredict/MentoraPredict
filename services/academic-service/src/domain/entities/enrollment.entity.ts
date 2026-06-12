export type EnrollmentStatus = "ACTIVE" | "WITHDRAWN";

export class EnrollmentEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly periodId: string,
    public status: EnrollmentStatus,
    public readonly enrolledAt: Date,
    public readonly createdAt: Date,
  ) {}

  withdraw(): void {
    if (this.status !== "ACTIVE") {
      throw new Error("Only active enrollments can be withdrawn");
    }
    this.status = "WITHDRAWN";
  }
}
