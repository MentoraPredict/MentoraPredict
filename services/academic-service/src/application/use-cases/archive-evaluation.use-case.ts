import {
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

@Injectable()
export class ArchiveEvaluationUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(evaluationId: string, teacherId: string, isActive: boolean) {
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

    // Grades associated with this evaluation are NOT deleted — only isActive is toggled
    evaluation.isActive = isActive;
    evaluation.updatedAt = new Date();

    return this.evalRepo.update(evaluation);
  }
}
