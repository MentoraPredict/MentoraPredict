import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { AlertEntity, AlertSeverity, AlertType } from '../../domain/entities/alert.entity';
import { GenerateAlertsDto } from '../dtos/generate-alerts.dto';

const UNREAD_LOOKUP_LIMIT = 50;

@Injectable()
export class GenerateAlertsUseCase {
  constructor(
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
  ) {}

  // Idempotent per (student, subject): skips a check whose alert type is
  // already UNREAD for this subject, so calling this on every weekly
  // recalculation doesn't spam a fresh row for the same ongoing problem.
  // Once the student/teacher marks it READ, the same condition can alert
  // again on a later recalculation.
  async execute(studentId: string, input: GenerateAlertsDto): Promise<AlertEntity[]> {
    const { items: existing } = await this.alertRepo.findByStudentPaginated(
      studentId,
      { status: 'UNREAD', subjectId: input.subjectId },
      { page: 1, limit: UNREAD_LOOKUP_LIMIT },
    );
    const existingTypes = new Set(existing.map((a) => a.type));

    const alerts: AlertEntity[] = [];

    if (
      (input.riskLevel === 'HIGH' || input.riskLevel === 'CRITICAL') &&
      !existingTypes.has(input.riskLevel === 'CRITICAL' ? 'RISK_CRITICAL' : 'RISK_HIGH')
    ) {
      alerts.push(this.buildAlert(
        studentId,
        input.subjectId,
        input.riskLevel === 'CRITICAL' ? 'RISK_CRITICAL' : 'RISK_HIGH',
        input.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        `Student risk level is ${input.riskLevel}`,
        { riskLevel: input.riskLevel },
      ));
    }

    if (input.previousAverage !== undefined && input.previousAverage > 0 && !existingTypes.has('AVERAGE_DROP')) {
      const dropPct = ((input.previousAverage - input.currentAverage) / input.previousAverage) * 100;
      if (dropPct > 15) {
        alerts.push(this.buildAlert(
          studentId,
          input.subjectId,
          'AVERAGE_DROP',
          'MEDIUM',
          `Average dropped ${dropPct.toFixed(1)}% vs previous period`,
          { dropPct, previousAverage: input.previousAverage, currentAverage: input.currentAverage },
        ));
      }
    }

    if (input.failedEvaluations >= 3 && !existingTypes.has('FAILED_EVALUATIONS')) {
      alerts.push(this.buildAlert(
        studentId,
        input.subjectId,
        'FAILED_EVALUATIONS',
        'HIGH',
        `${input.failedEvaluations} evaluations below passing grade`,
        { failedEvaluations: input.failedEvaluations },
      ));
    }

    if (input.attendance < 70 && !existingTypes.has('LOW_ATTENDANCE')) {
      alerts.push(this.buildAlert(
        studentId,
        input.subjectId,
        'LOW_ATTENDANCE',
        'MEDIUM',
        `Attendance is ${input.attendance}% (below 70%)`,
        { attendance: input.attendance },
      ));
    }

    return Promise.all(alerts.map((a) => this.alertRepo.save(a)));
  }

  private buildAlert(
    studentId: string,
    subjectId: string,
    type: AlertType,
    severity: AlertSeverity,
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
      subjectId,
      null,
      severity,
    );
  }
}
