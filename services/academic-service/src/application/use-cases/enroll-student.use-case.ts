import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { EnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { IEnrollmentRepository } from "../ports/output/i-enrollment.repository";
import { ISubjectRepository } from "../ports/output/i-subject.repository";
import { IAcademicPeriodRepository } from "../ports/output/i-academic-period.repository";
import { EnrollStudentDto } from "../dtos/enroll-student.dto";

@Injectable()
export class EnrollStudentUseCase {
  constructor(
    @Inject("IEnrollmentRepository")
    private readonly enrollRepo: IEnrollmentRepository,
    @Inject("ISubjectRepository")
    private readonly subjectRepo: ISubjectRepository,
    @Inject("IAcademicPeriodRepository")
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(dto: EnrollStudentDto): Promise<EnrollmentEntity> {
    const subject = await this.subjectRepo.findById(dto.subjectId);
    if (!subject || !subject.isActive) {
      throw new NotFoundException("Subject not found or inactive");
    }

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new BadRequestException("Academic period is not active");
    }

    const activeCount = await this.enrollRepo.countActiveBySubject(
      dto.subjectId,
    );
    if (activeCount >= subject.maxCapacity) {
      throw new BadRequestException("Subject has no available capacity");
    }

    const existing = await this.enrollRepo.findByStudentSubjectAndPeriod(
      dto.studentId,
      dto.subjectId,
      subject.academicPeriodId,
    );
    if (existing?.status === "ACTIVE") {
      throw new ConflictException(
        "Student is already enrolled in this subject for the period",
      );
    }

    const now = new Date();
    const enrollment = new EnrollmentEntity(
      randomUUID(),
      dto.studentId,
      dto.subjectId,
      subject.academicPeriodId,
      "ACTIVE",
      now,
      now,
    );
    return this.enrollRepo.save(enrollment);
  }
}
