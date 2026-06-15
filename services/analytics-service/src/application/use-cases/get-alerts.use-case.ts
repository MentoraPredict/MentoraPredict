import { Inject, Injectable } from '@nestjs/common';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { AlertEntity } from '../../domain/entities/alert.entity';

@Injectable()
export class GetAlertsUseCase {
  constructor(
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
  ) {}

  async execute(studentId: string, unreadOnly?: boolean): Promise<AlertEntity[]> {
    return this.alertRepo.findByStudentId(studentId, unreadOnly);
  }
}
