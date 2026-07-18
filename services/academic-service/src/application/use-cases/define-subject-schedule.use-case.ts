import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IClassScheduleRepository } from '../ports/output/i-class-schedule.repository';
import { IClassSessionRepository } from '../ports/output/i-class-session.repository';
import { ClassScheduleEntity, DayOfWeek } from '../../domain/entities/class-schedule.entity';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { ClassScheduleSlotDto } from '../dtos/define-subject-schedule.dto';
import { getAcademicWeek, getSessionDatesInRange } from '../../infrastructure/utils/academic-week.util';

@Injectable()
export class DefineSubjectScheduleUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IClassScheduleRepository') private readonly scheduleRepo: IClassScheduleRepository,
    @Inject('IClassSessionRepository') private readonly sessionRepo: IClassSessionRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(
    subjectId: string,
    slots: ClassScheduleSlotDto[],
    callerId: string,
    callerRole: string,
  ): Promise<void> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException(`Subject with id '${subjectId}' not found`);

    if (callerRole === 'TEACHER') {
      const { isOwner } = await this.checkOwnershipUC.execute(subjectId, callerId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }

    // Fase B, por ahora: el horario se define una sola vez. Redefinirlo
    // borraría class_sessions ya generadas y, en cascada, cualquier
    // session_attendance que el docente ya haya registrado — se deja fuera
    // de alcance hasta que haga falta de verdad.
    const existing = await this.scheduleRepo.findBySubjectId(subjectId);
    if (existing.length > 0) {
      throw new ConflictException(
        'Esta materia ya tiene un horario definido. Contacta a un administrador para modificarlo.',
      );
    }

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period) throw new NotFoundException(`Academic period '${subject.academicPeriodId}' not found`);

    const now = new Date();
    const schedules = await this.scheduleRepo.saveMany(
      slots.map(
        (s) => new ClassScheduleEntity(randomUUID(), subjectId, s.dayOfWeek as DayOfWeek, s.startTime, s.endTime, now, now),
      ),
    );

    const sessions: ClassSessionEntity[] = [];
    for (const schedule of schedules) {
      const dates = getSessionDatesInRange(period.startDate, period.endDate, schedule.dayOfWeek);
      for (const date of dates) {
        const { academicWeek, academicYear } = getAcademicWeek(date);
        sessions.push(
          new ClassSessionEntity(randomUUID(), subjectId, schedule.id, date, academicWeek, academicYear, 'PLANNED', now, now),
        );
      }
    }
    await this.sessionRepo.saveMany(sessions);
  }
}
