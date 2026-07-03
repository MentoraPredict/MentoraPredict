import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IGradeRepository } from '../ports/output/i-grade.repository';

export interface EvaluationListItem {
  id: string;
  name: string;
  weight: number;
  dueDate: Date | null;
  isActive: boolean;
  gradedCount: number;
  totalEnrolled: number;
}

@Injectable()
export class ListEvaluationsUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IGradeRepository') private readonly gradeRepo: IGradeRepository,
  ) {}

  async execute(
    subjectId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<EvaluationListItem[]> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    // Students can only see evaluations if they are actively enrolled
    if (requesterRole === 'STUDENT') {
      const enrollment = await this.enrollmentRepo.findByStudentAndSubject(requesterId, subjectId);
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw new ForbiddenException('No estás matriculado activo en este curso');
      }
    }

    const evaluations = await this.evalRepo.findBySubjectId(subjectId);
    evaluations.sort((a, b) => b.weight - a.weight);

    const totalEnrolled = await this.enrollmentRepo.countActiveBySubject(subjectId);

    const items = await Promise.all(
      evaluations.map(async (e) => {
        const grades = await this.gradeRepo.findByEvaluationId(e.id);
        return {
          id: e.id,
          name: e.name,
          weight: e.weight,
          dueDate: e.dueDate,
          isActive: e.isActive,
          gradedCount: grades.length,
          totalEnrolled,
        };
      }),
    );

    return items;
  }
}
