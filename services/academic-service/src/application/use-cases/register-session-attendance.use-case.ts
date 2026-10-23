import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IClassSessionRepository } from '../ports/output/i-class-session.repository';
import { ISessionAttendanceRepository } from '../ports/output/i-session-attendance.repository';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { SessionAttendanceEntity } from '../../domain/entities/session-attendance.entity';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { SessionAttendanceRecordDto } from '../dtos/register-session-attendance.dto';
import { todayInEcuador } from '../dtos/school-year.view';
import { AttendanceStatus } from '../../domain/entities/attendance.entity';
import { isWorse } from '../../domain/services/attendance-rules';
import { AttendanceCalculator } from '../services/attendance-calculator';
import { AttendanceNotifier } from '../services/attendance-notifier';
import { IAttendanceRepository } from '../ports/output/i-attendance.repository';
import { IGradingRepository } from '../ports/output/i-grading.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

@Injectable()
export class RegisterSessionAttendanceUseCase {
  constructor(
    @Inject('IClassSessionRepository') private readonly sessionRepo: IClassSessionRepository,
    @Inject('ISessionAttendanceRepository') private readonly attendanceRepo: ISessionAttendanceRepository,
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
    private readonly checkOwnershipUC: CheckSubjectOwnershipUseCase,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IAttendanceRepository') private readonly attendanceQuery: IAttendanceRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    private readonly calculator: AttendanceCalculator,
    private readonly notifier: AttendanceNotifier,
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

    // Cursos de paralelo: solo clases ya dictadas, solo estudiantes del curso,
    // y se compara el estado antes/después para avisar a los representantes.
    const subject = await this.subjectRepo.findById(subjectId);
    const sectionId = subject?.sectionId ?? null;
    let before = new Map<string, AttendanceStatus>();
    if (sectionId) {
      if (callerRole === 'TEACHER' && session.sessionDate.toISOString().slice(0, 10) > todayInEcuador()) {
        throw new ConflictException('No se puede registrar la asistencia de una clase futura');
      }
      const roster = new Set(await this.grading.listActiveStudentIds(subjectId));
      if (records.some((r) => !roster.has(r.studentId))) {
        throw new BadRequestException('Hay estudiantes que no pertenecen a este curso');
      }
      before = await this.statuses(subjectId, sectionId);
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

    if (sectionId && subject) await this.notifyWorsened(subject.name, subjectId, sectionId, before);
  }

  private async statuses(subjectId: string, sectionId: string) {
    const ctx = await this.calculator.contextForSection(sectionId);
    const records = await this.attendanceQuery.listRecords({ subjectId });
    const result = new Map<string, AttendanceStatus>();
    for (const studentId of new Set(records.map((r) => r.studentId))) {
      result.set(studentId, this.calculator.evaluate(records.filter((r) => r.studentId === studentId), ctx).evaluation.status);
    }
    return result;
  }

  private async notifyWorsened(courseName: string, subjectId: string, sectionId: string, before: Map<string, AttendanceStatus>) {
    const ctx = await this.calculator.contextForSection(sectionId);
    const records = await this.attendanceQuery.listRecords({ subjectId });
    for (const studentId of new Set(records.map((r) => r.studentId))) {
      const { summary, evaluation } = this.calculator.evaluate(records.filter((r) => r.studentId === studentId), ctx);
      if (evaluation.status !== 'OK' && isWorse(evaluation.status, before.get(studentId) ?? 'OK')) {
        await this.notifier.notifyThreshold({ studentId, courseName, status: evaluation.status, summary, maxPct: ctx.rule.maxUnjustifiedPct });
      }
    }
  }
}
