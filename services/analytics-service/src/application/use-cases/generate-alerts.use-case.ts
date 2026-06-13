import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { AlertEntity, AlertType } from '../../domain/entities/alert.entity';
import { GenerateAlertsDto } from '../dtos/generate-alerts.dto';

@Injectable()
export class GenerateAlertsUseCase {
  constructor(
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
  ) {}

  async execute(studentId: string, input: GenerateAlertsDto): Promise<AlertEntity[]> {
    const alerts: AlertEntity[] = [];

    if (input.riskLevel === 'HIGH' || input.riskLevel === 'CRITICAL') {
      alerts.push(this.buildAlert(
        studentId,
        input.riskLevel === 'CRITICAL' ? 'RISK_CRITICAL' : 'RISK_HIGH',
        `Student risk level is ${input.riskLevel}`,
        { riskLevel: input.riskLevel },
      ));
    }

    if (input.previousAverage !== undefined && input.previousAverage > 0) {
      const dropPct = ((input.previousAverage - input.currentAverage) / input.previousAverage) * 100;
      if (dropPct > 15) {
        alerts.push(this.buildAlert(
          studentId,
          'AVERAGE_DROP',
          `Average dropped ${dropPct.toFixed(1)}% vs previous period`,
          { dropPct, previousAverage: input.previousAverage, currentAverage: input.currentAverage },
        ));
      }
    }

    if (input.failedEvaluations >= 3) {
      alerts.push(this.buildAlert(
        studentId,
        'FAILED_EVALUATIONS',
        `${input.failedEvaluations} evaluations below passing grade`,
        { failedEvaluations: input.failedEvaluations },
      ));
    }

    if (input.attendance < 70) {
      alerts.push(this.buildAlert(
        studentId,
        'LOW_ATTENDANCE',
        `Attendance is ${input.attendance}% (below 70%)`,
        { attendance: input.attendance },
      ));
    }

    return Promise.all(alerts.map((a) => this.alertRepo.save(a)));
  }

  private buildAlert(
    studentId: string,
    type: AlertType,
    message: string,
    metadata: Record<string, unknown>,
  ): AlertEntity {
    return new AlertEntity(
      randomUUID(),
      studentId,
      type,
      message,
      'UNREAD',
      new Date(),
      metadata,
    );
  }
}
