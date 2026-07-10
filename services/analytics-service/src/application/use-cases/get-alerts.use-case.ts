import { Inject, Injectable } from '@nestjs/common';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { AlertEntity } from '../../domain/entities/alert.entity';

@Injectable()
export class GetAlertsUseCase {
  constructor(
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
  ) {}

  async execute(
    studentId: string,
    filters: { status?: string; subjectId?: string; periodId?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ data: AlertEntity[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.alertRepo.findByStudentPaginated(studentId, filters, pagination);
    return { data: items, total, page: pagination.page, limit: pagination.limit };
  }
}
