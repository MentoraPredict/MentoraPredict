import { ConflictException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IAnalyticsClientPort } from '../ports/output/i-analytics-client.port';
import { WeeklyCheckInEntity } from '../../domain/entities/weekly-check-in.entity';
import { getAcademicWeek } from '../../infrastructure/utils/academic-week.util';
import { CreateCheckInDto } from '../dtos/create-check-in.dto';

@Injectable()
export class UpsertCheckInUseCase {
  private readonly logger = new Logger(UpsertCheckInUseCase.name);

  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAnalyticsClientPort') private readonly analyticsClient: IAnalyticsClientPort,
  ) {}

  async execute(
    studentId: string,
    subjectId: string,
    dto: CreateCheckInDto,
  ): Promise<WeeklyCheckInEntity> {
    const activePeriod = await this.periodRepo.findActive();
    if (!activePeriod) {
      throw new ConflictException('No hay un periodo académico activo. Contacta al administrador.');
    }

    const enrollment = await this.enrollmentRepo.findByStudentSubjectAndPeriod(
      studentId,
      subjectId,
      activePeriod.id,
    );
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenException('No estás matriculado activo en este curso en el periodo actual');
    }

    const now = new Date();
    const { academicWeek, academicYear } = getAcademicWeek(now);

    const entity = new WeeklyCheckInEntity(
      randomUUID(),
      studentId,
      subjectId,
      activePeriod.id,
      academicWeek,
      academicYear,
      now,
      dto.attendance,
      dto.taskCompletion,
      dto.studyHours,
      dto.emotionalState,
      dto.generalComprehension,
      dto.topicResponses ?? [],
      dto.notes ?? null,
      now,
      now,
    );

    const { checkIn } = await this.checkInRepo.upsert(entity);

    // Fire-and-forget: same pattern as ImportSubjectGradesUseCase (Phase 4) —
    // a failed analytics call must not fail the student's check-in save.
    this.analyticsClient
      .triggerRecalculate(subjectId, activePeriod.id, [studentId])
      .catch((err) =>
        this.logger.error(`Analytics trigger failed: ${err instanceof Error ? err.message : String(err)}`),
      );

    return checkIn;
  }
}
