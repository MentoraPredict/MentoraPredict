import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { GradeEntity } from "../../domain/entities/grade.entity";
import { IGradeRepository } from "../ports/output/i-grade.repository";
import { IEvaluationRepository } from "../ports/output/i-evaluation.repository";
import { IEnrollmentRepository } from "../ports/output/i-enrollment.repository";
import { RecordGradeDto } from "../dtos/record-grade.dto";

@Injectable()
export class RecordGradeUseCase {
  constructor(
    @Inject("IGradeRepository") private readonly gradeRepo: IGradeRepository,
    @Inject("IEvaluationRepository")
    private readonly evalRepo: IEvaluationRepository,
    @Inject("IEnrollmentRepository")
    private readonly enrollRepo: IEnrollmentRepository,
  ) {}

  async execute(dto: RecordGradeDto, teacherId: string): Promise<GradeEntity> {
    const evaluation = await this.evalRepo.findById(dto.evaluationId);
    if (!evaluation) throw new NotFoundException("Evaluation not found");

    const enrollment = await this.enrollRepo.findByStudentAndSubject(
      dto.studentId,
      evaluation.subjectId,
    );
    if (!enrollment || enrollment.status !== "ACTIVE") {
      throw new BadRequestException(
        "Student is not actively enrolled in this subject",
      );
    }

    const existing = await this.gradeRepo.findByStudentAndEvaluation(
      dto.studentId,
      dto.evaluationId,
    );
    if (existing)
      throw new ConflictException(
        "Grade already recorded for this student and evaluation",
      );

    const now = new Date();
    const grade = new GradeEntity(
      randomUUID(),
      dto.studentId,
      evaluation.subjectId,
      dto.value,
      teacherId,
      now,
      now,
      now,
      dto.evaluationId,
    );

    return this.gradeRepo.save(grade);
  }
}
