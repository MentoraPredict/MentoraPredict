import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { AlertEntity } from '../../domain/entities/alert.entity';

@Injectable()
export class ResolveAlertUseCase {
  constructor(
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
    @Inject('IAcademicServiceClient') private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(alertId: string, teacherId: string, note?: string): Promise<AlertEntity> {
    const alert = await this.alertRepo.findById(alertId);
    // Only Fase 7 automatic alerts (subjectId set, status ACTIVE) are
    // resolvable here — legacy manual UNREAD/READ alerts have no subject to
    // check ownership against.
    if (!alert || alert.status !== 'ACTIVE' || !alert.subjectId) {
      throw new NotFoundException('Alerta no encontrada o no está activa');
    }

    const { isOwner } = await this.academic.getSubjectOwnership(teacherId, alert.subjectId);
    if (!isOwner) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    alert.resolve(teacherId);
    if (note) {
      alert.metadata = { ...alert.metadata, resolutionNote: note };
    }
    return this.alertRepo.update(alert);
  }
}
