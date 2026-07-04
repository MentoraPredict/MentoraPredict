import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { AlertEntity } from '../../domain/entities/alert.entity';

@Injectable()
export class GetSubjectAlertsUseCase {
  constructor(
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
    @Inject('IAcademicServiceClient') private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(
    subjectId: string,
    teacherId: string,
    filters: { status?: string; severity?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ data: AlertEntity[]; total: number; page: number; limit: number }> {
    const { isOwner } = await this.academic.getSubjectOwnership(teacherId, subjectId);
    if (!isOwner) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    const { items, total } = await this.alertRepo.findBySubjectPaginated(subjectId, filters, pagination);
    return { data: items, total, page: pagination.page, limit: pagination.limit };
  }
}
