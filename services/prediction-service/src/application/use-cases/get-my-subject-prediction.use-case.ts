import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ACADEMIC_CONTEXT_CLIENT } from './generate-prediction.use-case';
import { STUDENT_SUBJECT_PREDICTION_REPO } from './recalculate-subject-prediction.use-case';
import { IAcademicContextClient } from '../ports/output/i-academic-context.client';
import { IStudentSubjectPredictionRepository } from '../../domain/ports/i-student-subject-prediction.repository';
import { StudentSubjectPredictionEntity } from '../../domain/entities/student-subject-prediction.entity';

@Injectable()
export class GetMySubjectPredictionUseCase {
  constructor(
    @Inject(STUDENT_SUBJECT_PREDICTION_REPO)
    private readonly predictionRepo: IStudentSubjectPredictionRepository,
    @Inject(ACADEMIC_CONTEXT_CLIENT) private readonly academic: IAcademicContextClient,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<StudentSubjectPredictionEntity | null> {
    const enrollments = await this.academic.getEnrollmentsByStudent(studentId);
    const enrolled = enrollments.some((e) => e.subjectId === subjectId && e.status === 'ACTIVE');
    if (!enrolled) {
      throw new NotFoundException('No estás matriculado activo en esta materia');
    }

    return this.predictionRepo.findLatestByStudentAndSubject(studentId, subjectId);
  }
}
