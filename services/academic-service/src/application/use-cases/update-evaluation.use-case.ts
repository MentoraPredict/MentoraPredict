import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

export interface UpdateEvaluationInput {
  name?: string;
  weight?: number;
  dueDate?: string | null;
}

@Injectable()
export class UpdateEvaluationUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(evaluationId: string, teacherId: string, input: UpdateEvaluationInput) {
    const evaluation = await this.evalRepo.findById(evaluationId);
    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');

    const subject = await this.subjectRepo.findById(evaluation.subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
      evaluation.subjectId,
      teacherId,
      subject.academicPeriodId,
    );
    if (!assignment) throw new ForbiddenException('No tienes acceso a este curso');

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException('No se puede modificar evaluaciones de un periodo inactivo');
    }

    // Weight validation: sum of other active evals + new weight must not exceed 100
    if (input.weight !== undefined) {
      const otherWeightsTotal = await this.evalRepo.getTotalWeightExcluding(
        evaluation.subjectId,
        evaluationId,
      );
      if (otherWeightsTotal + input.weight > 100) {
        throw new BadRequestException(
          `Agregar ${input.weight}% excedería el límite de 100%. Total de otras evaluaciones activas: ${otherWeightsTotal}%`,
        );
      }
      evaluation.weight = input.weight;
    }

    if (input.name !== undefined) evaluation.name = input.name;
    if (input.dueDate !== undefined) {
      evaluation.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    evaluation.updatedAt = new Date();

    return this.evalRepo.update(evaluation);
  }
}
