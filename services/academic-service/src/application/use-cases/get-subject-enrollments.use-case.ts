import { Inject, Injectable } from "@nestjs/common";
import { EnrollmentStatus } from "../../domain/entities/enrollment.entity";
import { IEnrollmentRepository } from "../ports/output/i-enrollment.repository";

export interface SubjectEnrollmentView {
  id: string;
  studentId: string;
  subjectId: string;
  periodId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
}

@Injectable()
export class GetSubjectEnrollmentsUseCase {
  constructor(
    @Inject("IEnrollmentRepository")
    private readonly enrollRepo: IEnrollmentRepository,
  ) {}

  async execute(subjectId: string): Promise<SubjectEnrollmentView[]> {
    const enrollments = await this.enrollRepo.findBySubjectId(subjectId);

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      subjectId: enrollment.subjectId,
      periodId: enrollment.periodId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    }));
  }
}
