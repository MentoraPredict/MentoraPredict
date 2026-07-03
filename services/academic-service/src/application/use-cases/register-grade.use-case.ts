import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { GradeEntity } from "../../domain/entities/grade.entity";
import { IGradeRepository } from "../ports/output/i-grade.repository";
import { IEnrollmentRepository } from "../ports/output/i-enrollment.repository";
import { ISubjectRepository } from "../ports/output/i-subject.repository";
import { IAcademicPeriodRepository } from "../ports/output/i-academic-period.repository";
import { RegisterGradeDto } from "../dtos/register-grade.dto";

@Injectable()
export class RegisterGradeUseCase {
  constructor(
    @Inject("IGradeRepository") private readonly gradeRepo: IGradeRepository,
    @Inject("IEnrollmentRepository")
    private readonly enrollRepo: IEnrollmentRepository,
    @Inject("ISubjectRepository")
    private readonly subjectRepo: ISubjectRepository,
    @Inject("IAcademicPeriodRepository")
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(
    dto: RegisterGradeDto,
    registeredBy: string,
  ): Promise<GradeEntity> {
    if (dto.grade < 0 || dto.grade > 10) {
      throw new BadRequestException("Grade must be between 0 and 10");
    }

    const enrollment = await this.enrollRepo.findByStudentAndSubject(
      dto.studentId,
      dto.subjectId,
    );
    if (!enrollment || enrollment.status !== "ACTIVE") {
      throw new BadRequestException(
        "Student is not actively enrolled in this subject",
      );
    }

    const subject = await this.subjectRepo.findById(dto.subjectId);
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException(
        "No se pueden registrar calificaciones en un periodo inactivo",
      );
    }

    const existing = await this.gradeRepo.findByStudentAndSubject(
      dto.studentId,
      dto.subjectId,
    );
    if (existing) {
      throw new ConflictException(
        "Grade already registered for this student and subject",
      );
    }

    const now = new Date();
    const grade = new GradeEntity(
      randomUUID(),
      dto.studentId,
      dto.subjectId,
      dto.grade,
      registeredBy,
      now,
      now,
      now,
    );

    return this.gradeRepo.save(grade);
  }
}
