import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { EnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { IEnrollmentRepository } from "../ports/output/i-enrollment.repository";
import { ISubjectRepository } from "../ports/output/i-subject.repository";
import { IAcademicPeriodRepository } from "../ports/output/i-academic-period.repository";
import { ISubjectTeacherRepository } from "../ports/output/i-subject-teacher.repository";
import { IUserProfilePort } from "../ports/output/i-user-profile.port";
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
    @Inject("ISubjectTeacherRepository")
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject("IUserProfilePort")
    private readonly userProfilePort: IUserProfilePort,
  ) {}

  async execute(
    dto: EnrollStudentDto,
    teacherId: string,
  ): Promise<EnrollmentEntity> {
    const subject = await this.subjectRepo.findById(dto.subjectId);
    if (!subject || !subject.isActive) {
      throw new NotFoundException("Subject not found or inactive");
    }

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new BadRequestException("Academic period is not active");
    }

    // Teacher must own this course
    const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
      dto.subjectId,
      teacherId,
      subject.academicPeriodId,
    );
    if (!assignment) {
      throw new ForbiddenException("No tienes acceso a este curso");
    }

    // Student must exist and be an active STUDENT
    const profile = await this.userProfilePort.getProfile(dto.studentId);
    if (!profile) throw new NotFoundException("Student not found");
    if (profile.role !== "STUDENT") {
      throw new BadRequestException("User is not a STUDENT");
    }
    if (profile.status !== "ACTIVE") {
      throw new BadRequestException("Student account is not active");
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

    const result = await this.enrollRepo.saveWithCapacityCheck(
      enrollment,
      subject.maxCapacity,
    );

    if (result === "already_enrolled") {
      throw new ConflictException(
        "Student is already enrolled in this subject for the period",
      );
    }
    if (result === "at_capacity") {
      throw new BadRequestException("Subject has no available capacity");
    }

    return enrollment;
  }
}
