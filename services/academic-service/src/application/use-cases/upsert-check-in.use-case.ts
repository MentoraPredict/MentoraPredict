import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IAnalyticsClientPort } from '../ports/output/i-analytics-client.port';
import { ITopicRepository } from '../ports/output/i-topic.repository';
import { IClassSessionRepository } from '../ports/output/i-class-session.repository';
import { ISessionAttendanceRepository } from '../ports/output/i-session-attendance.repository';
import { WeeklyCheckInEntity } from '../../domain/entities/weekly-check-in.entity';
import { SessionAttendanceEntity } from '../../domain/entities/session-attendance.entity';
import { getAcademicWeek } from '../../infrastructure/utils/academic-week.util';
import { CreateCheckInDto } from '../dtos/create-check-in.dto';

// Umbral para convertir el 0-100 autorreportado del estudiante en un
// present/absent booleano por sesión (docs/database/database-update-plan.md
// §5.2) — no hay una escala fina de "cuánto asististe" a nivel de sesión,
// así que >= 50 se interpreta como presente.
const SELF_REPORT_PRESENT_THRESHOLD = 50;

@Injectable()
export class UpsertCheckInUseCase {
  private readonly logger = new Logger(UpsertCheckInUseCase.name);

  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAnalyticsClientPort') private readonly analyticsClient: IAnalyticsClientPort,
    @Inject('ITopicRepository') private readonly topicRepo: ITopicRepository,
    @Inject('IClassSessionRepository') private readonly classSessionRepo: IClassSessionRepository,
    @Inject('ISessionAttendanceRepository') private readonly sessionAttendanceRepo: ISessionAttendanceRepository,
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

    if (dto.topicResponses?.length) {
      const topics = await this.topicRepo.findBySubjectIdOrdered(subjectId);
      const validTopicIds = new Set(topics.map((t) => t.id));
      const unknownTopicId = dto.topicResponses.find((r) => !validTopicIds.has(r.topicId));
      if (unknownTopicId) {
        throw new BadRequestException(
          `El tema ${unknownTopicId.topicId} no pertenece al sílabo de esta materia`,
        );
      }
    }

    const now = new Date();
    const { academicWeek, academicYear } = getAcademicWeek(now);

    const attendance = await this.resolveAttendance(studentId, subjectId, academicWeek, academicYear, dto.attendance, now);

    const entity = new WeeklyCheckInEntity(
      randomUUID(),
      studentId,
      subjectId,
      activePeriod.id,
      academicWeek,
      academicYear,
      now,
      attendance,
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

  // Fase B (docs/database/database-update-plan.md §5.2): registra el
  // autorreporte del estudiante como asistencia real (session_attendances)
  // en CADA sesión de esa semana — una materia puede tener más de una franja
  // horaria (ej. lunes y miércoles) — y devuelve el % de sesiones presentes
  // que se guarda en weekly_check_ins.attendance. Un registro docente para
  // una sesión siempre prevalece sobre el autorreporte de esa misma sesión.
  // Si todavía no hay ninguna sesión definida para esa semana (materia sin
  // horario aún, o dato legado de antes de esta fase), no bloquea el
  // check-in: se usa el número crudo que mandó el estudiante, igual que antes.
  private async resolveAttendance(
    studentId: string,
    subjectId: string,
    academicWeek: number,
    academicYear: number,
    selfReportedAttendance: number,
    now: Date,
  ): Promise<number> {
    const sessions = await this.classSessionRepo.findBySubjectWeek(subjectId, academicWeek, academicYear);
    if (sessions.length === 0) {
      this.logger.warn(
        `No class_sessions found for subject ${subjectId} week ${academicWeek}/${academicYear} — falling back to raw self-reported attendance`,
      );
      return selfReportedAttendance;
    }

    const selfReportPresent = selfReportedAttendance >= SELF_REPORT_PRESENT_THRESHOLD;
    await this.sessionAttendanceRepo.upsertMany(
      sessions.map(
        (session) =>
          new SessionAttendanceEntity(randomUUID(), session.id, studentId, selfReportPresent, 'STUDENT_SELF_REPORT', now),
      ),
    );

    let presentCount = 0;
    for (const session of sessions) {
      const records = (await this.sessionAttendanceRepo.findBySession(session.id)).filter(
        (r) => r.studentId === studentId,
      );
      const teacherRecord = records.find((r) => r.recordedBy === 'TEACHER');
      const present = teacherRecord ? teacherRecord.present : records.some((r) => r.present);
      if (present) presentCount++;
    }

    return Math.round((100 * presentCount) / sessions.length);
  }
}
