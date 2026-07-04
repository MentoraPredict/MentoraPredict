import { Inject, Injectable } from '@nestjs/common';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { StudentSubjectMetricsEntity } from '../../domain/entities/student-subject-metrics.entity';

@Injectable()
export class GetStudentSubjectMetricsUseCase {
  constructor(
    @Inject('IStudentSubjectMetricsRepository')
    private readonly metricsRepo: IStudentSubjectMetricsRepository,
  ) {}

  async execute(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ data: StudentSubjectMetricsEntity[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.metricsRepo.findByStudentSubjectPaginated(
      studentId,
      subjectId,
      pagination,
    );
    return { data: items, total, page: pagination.page, limit: pagination.limit };
  }
}
