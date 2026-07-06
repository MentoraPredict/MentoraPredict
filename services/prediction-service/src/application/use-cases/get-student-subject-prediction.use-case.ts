import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ACADEMIC_CONTEXT_CLIENT } from './generate-prediction.use-case';
import { STUDENT_SUBJECT_PREDICTION_REPO } from './recalculate-subject-prediction.use-case';
import { IAcademicContextClient } from '../ports/output/i-academic-context.client';
import { IStudentSubjectPredictionRepository } from '../../domain/ports/i-student-subject-prediction.repository';
import { StudentSubjectPredictionEntity } from '../../domain/entities/student-subject-prediction.entity';

@Injectable()
export class GetStudentSubjectPredictionUseCase {
  constructor(
    @Inject(STUDENT_SUBJECT_PREDICTION_REPO)
    private readonly predictionRepo: IStudentSubjectPredictionRepository,
    @Inject(ACADEMIC_CONTEXT_CLIENT) private readonly academic: IAcademicContextClient,
  ) {}

  async execute(
    subjectId: string,
    studentId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<StudentSubjectPredictionEntity | null> {
    if (requesterRole === 'TEACHER') {
      const { isOwner } = await this.academic.getSubjectOwnership(requesterId, subjectId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }
    // ADMIN: no ownership restriction.

    return this.predictionRepo.findLatestByStudentAndSubject(studentId, subjectId);
  }
}
