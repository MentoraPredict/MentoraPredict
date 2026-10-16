import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IClassSessionRepository } from '../ports/output/i-class-session.repository';
import { ISessionAttendanceRepository } from '../ports/output/i-session-attendance.repository';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { SessionAttendanceEntity } from '../../domain/entities/session-attendance.entity';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { SessionAttendanceRecordDto } from '../dtos/register-session-attendance.dto';

@Injectable()
export class RegisterSessionAttendanceUseCase {
  constructor(
    @Inject('IClassSessionRepository') private readonly sessionRepo: IClassSessionRepository,
    @Inject('ISessionAttendanceRepository') private readonly attendanceRepo: ISessionAttendanceRepository,
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(
    subjectId: string,
    sessionId: string,
    records: SessionAttendanceRecordDto[],
    callerId: string,
    callerRole: string,
  ): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.subjectId !== subjectId) {
      throw new NotFoundException(`Session '${sessionId}' not found for subject '${subjectId}'`);
    }

    if (callerRole === 'TEACHER') {
      const { isOwner } = await this.checkOwnershipUC.execute(subjectId, callerId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }

    const now = new Date();
    await this.attendanceRepo.upsertMany(
      records.map(
        (r) => new SessionAttendanceEntity(randomUUID(), sessionId, r.studentId, r.present, 'TEACHER', now),
      ),
    );

    // El registro docente prevalece sobre el autorreporte (ver
    // docs/database/database-update-plan.md §5.2). Si la materia tiene más
    // de una franja horaria esa semana, el % de asistencia del check-in se
    // recalcula sobre TODAS las sesiones de la semana, no solo esta —
    // corrige el check-in ya enviado en vez de dejarlo desactualizado hasta
    // el próximo envío del estudiante.
    const weekSessions = await this.sessionRepo.findBySubjectWeek(subjectId, session.academicWeek, session.academicYear);

    for (const record of records) {
      const checkIn = await this.checkInRepo.findByStudentSubjectWeek(
        record.studentId,
        subjectId,
        session.academicWeek,
        session.academicYear,
      );
      if (!checkIn) continue;

      let presentCount = 0;
      for (const weekSession of weekSessions) {
        const attendances = (await this.attendanceRepo.findBySession(weekSession.id)).filter(
          (a) => a.studentId === record.studentId,
        );
        const teacherRecord = attendances.find((a) => a.recordedBy === 'TEACHER');
        const present = teacherRecord ? teacherRecord.present : attendances.some((a) => a.present);
        if (present) presentCount++;
      }

      checkIn.applyPartialUpdate({ attendance: Math.round((100 * presentCount) / weekSessions.length) });
      await this.checkInRepo.update(checkIn);
    }
  }
}
