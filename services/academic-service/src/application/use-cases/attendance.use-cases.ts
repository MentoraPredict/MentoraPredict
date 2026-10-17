import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  JustificationStatus,
} from '../../domain/entities/attendance.entity';
import { isWithinJustificationWindow } from '../../domain/services/attendance-rules';
import { todayInEcuador } from '../dtos/school-year.view';
import { RequestJustificationDto, ResolveJustificationDto } from '../dtos/attendance.dto';
import { AttendanceCalculator } from '../services/attendance-calculator';
import { AttendanceNotifier } from '../services/attendance-notifier';
import { IAttendanceRepository } from '../ports/output/i-attendance.repository';
import { IGradingRepository } from '../ports/output/i-grading.repository';
import { IPeopleRepository } from '../ports/output/i-people.repository';
import { IStudentEnrollmentRepository } from '../ports/output/i-student-enrollment.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { CheckSubjectOwnershipUseCase } from './check-subject-ownership.use-case';
import { Caller } from './people-enrollment.use-cases';

const STAFF_ROLES = ['ADMIN', 'SECRETARY', 'INSPECTOR', 'DECE'];
const AUTHORITY_ROLES = ['ADMIN', 'INSPECTOR'];
const ACTIVE_STATES = ['ACTIVE', 'PROMOTED', 'REPEATED'];

const displayName = (p: { firstName: string; lastName: string } | null, fallback: string) =>
  p ? `${p.firstName} ${p.lastName}`.trim() || fallback : fallback;

export interface AttendanceStatusView {
  summary: AttendanceSummary;
  status: AttendanceStatus;
  reachedWarningPct: number | null;
  applies: boolean;
}

// ── Asistencia de un curso (docente / autoridades) ───────────────────────────

export interface CourseAttendanceView {
  subject: { id: string; name: string };
  planned: number;
  held: number;
  /** Clases que ya tienen asistencia registrada. */
  recordedSessionIds: string[];
  rule: { maxPct: number; warningPcts: number[]; applies: boolean };
  students: Array<{ studentId: string; name: string } & AttendanceStatusView>;
}

@Injectable()
export class GetCourseAttendanceUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: AttendanceCalculator,
    private readonly ownership: CheckSubjectOwnershipUseCase,
  ) {}

  async execute(subjectId: string, caller: Caller): Promise<CourseAttendanceView> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject || !subject.sectionId) {
      throw new NotFoundException('El curso no existe o no pertenece a un paralelo');
    }
    if (caller.role === 'TEACHER') {
      if (!(await this.ownership.execute(subjectId, caller.id)).isOwner) {
        throw new ForbiddenException('No tienes acceso a este curso');
      }
    } else if (!STAFF_ROLES.includes(caller.role)) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    const [ctx, studentIds, records, planned] = await Promise.all([
      this.calculator.contextForSection(subject.sectionId),
      this.grading.listActiveStudentIds(subjectId),
      this.attendance.listRecords({ subjectId }),
      this.attendance.countPlannedSessions([subjectId]),
    ]);

    const students = await Promise.all(
      studentIds.map(async (studentId) => {
        const profile = await this.profiles.getProfile(studentId).catch(() => null);
        const { summary, evaluation } = this.calculator.evaluate(
          records.filter((r) => r.studentId === studentId),
          ctx,
        );
        return {
          studentId,
          name: displayName(profile, studentId),
          summary,
          status: evaluation.status,
          reachedWarningPct: evaluation.reachedWarningPct,
          applies: evaluation.applies,
        };
      }),
    );
    students.sort((a, b) => a.name.localeCompare(b.name, 'es'));

    return {
      subject: { id: subject.id, name: subject.name },
      planned: planned.get(subjectId) ?? 0,
      held: new Set(records.map((r) => r.sessionId)).size,
      recordedSessionIds: [...new Set(records.map((r) => r.sessionId))],
      rule: { maxPct: ctx.rule.maxUnjustifiedPct, warningPcts: ctx.rule.warningPcts, applies: ctx.applies },
      students,
    };
  }
}

@Injectable()
export class GetSessionAttendanceUseCase {
  constructor(
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    private readonly ownership: CheckSubjectOwnershipUseCase,
  ) {}

  /** Lo que el docente ya registró en una clase, para editarlo. */
  async execute(subjectId: string, sessionId: string, caller: Caller): Promise<Array<{ studentId: string; present: boolean }>> {
    if (caller.role === 'TEACHER' && !(await this.ownership.execute(subjectId, caller.id)).isOwner) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }
    const records = await this.attendance.listRecords({ subjectId });
    return records
      .filter((r) => r.sessionId === sessionId)
      .map((r) => ({ studentId: r.studentId, present: r.present }));
  }
}

// ── Asistencia de un estudiante (estudiante / representante / autoridades) ───

export interface StudentAbsenceView {
  sessionId: string;
  subjectId: string;
  courseName: string;
  date: string;
  justification: { id: string; status: JustificationStatus; reason: string; note: string | null } | null;
  canJustify: boolean;
}

export interface StudentAttendanceView {
  studentId: string;
  studentName: string;
  rule: { maxPct: number; warningPcts: number[]; justificationDays: number | null; applies: boolean };
  courses: Array<{ subjectId: string; name: string } & AttendanceStatusView>;
  absences: StudentAbsenceView[];
}

@Injectable()
export class GetStudentAttendanceUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: AttendanceCalculator,
  ) {}

  async execute(studentId: string, caller: Caller): Promise<StudentAttendanceView> {
    const allowed =
      STAFF_ROLES.includes(caller.role) ||
      (caller.role === 'STUDENT' && caller.id === studentId) ||
      (caller.role === 'GUARDIAN' && Boolean(await this.people.findGuardianLink(caller.id, studentId)));
    if (!allowed) throw new ForbiddenException('No tienes acceso a la asistencia de este estudiante');

    const enrollment = (await this.studentEnrollments.listByStudent(studentId)).find((e) =>
      ACTIVE_STATES.includes(e.status),
    );
    if (!enrollment) throw new NotFoundException('El estudiante no tiene matrícula vigente');

    const [ctx, courses, profile] = await Promise.all([
      this.calculator.contextForSection(enrollment.sectionId),
      this.grading.listSectionCourses(enrollment.sectionId),
      this.profiles.getProfile(studentId).catch(() => null),
    ]);
    const records = await this.attendance.listRecords({
      studentId,
      subjectIds: courses.map((c) => c.id),
    });
    const today = todayInEcuador();
    const courseName = new Map(courses.map((c) => [c.id, c.name]));

    const absences: StudentAbsenceView[] = [];
    for (const record of records.filter((r) => !r.present)) {
      const justification = await this.attendance.findJustification(record.sessionId, studentId);
      absences.push({
        sessionId: record.sessionId,
        subjectId: record.subjectId,
        courseName: courseName.get(record.subjectId) ?? '',
        date: record.sessionDate,
        justification: justification
          ? {
              id: justification.id,
              status: justification.status,
              reason: justification.reason,
              note: justification.resolutionNote,
            }
          : null,
        canJustify:
          !justification && isWithinJustificationWindow(record.sessionDate, today, ctx.rule.justificationDays),
      });
    }

    return {
      studentId,
      studentName: displayName(profile, studentId),
      rule: {
        maxPct: ctx.rule.maxUnjustifiedPct,
        warningPcts: ctx.rule.warningPcts,
        justificationDays: ctx.rule.justificationDays,
        applies: ctx.applies,
      },
      courses: courses.map((course) => {
        const { summary, evaluation } = this.calculator.evaluate(
          records.filter((r: AttendanceRecord) => r.subjectId === course.id),
          ctx,
        );
        return {
          subjectId: course.id,
          name: course.name,
          summary,
          status: evaluation.status,
          reachedWarningPct: evaluation.reachedWarningPct,
          applies: evaluation.applies,
        };
      }),
      absences: absences.sort((a, b) => b.date.localeCompare(a.date)),
    };
  }
}

// ── Seguimiento por paralelo (inspección, DECE, administración) ──────────────

export interface SectionAttendanceRow {
  studentId: string;
  name: string;
  worstStatus: AttendanceStatus;
  courses: Array<{ subjectId: string; name: string; unjustifiedPct: number; absences: number; status: AttendanceStatus }>;
}

const STATUS_ORDER: AttendanceStatus[] = ['OK', 'WARNING', 'EXCEEDED'];

@Injectable()
export class GetSectionAttendanceUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: AttendanceCalculator,
  ) {}

  async execute(sectionId: string): Promise<SectionAttendanceRow[]> {
    const [ctx, courses, enrollments] = await Promise.all([
      this.calculator.contextForSection(sectionId),
      this.grading.listSectionCourses(sectionId),
      this.studentEnrollments.listBySection(sectionId, 'ACTIVE'),
    ]);
    const subjectIds = courses.map((c) => c.id);
    const records = await this.attendance.listRecords({ subjectIds });

    const rows = await Promise.all(
      enrollments.map(async (enrollment) => {
        const profile = await this.profiles.getProfile(enrollment.studentId).catch(() => null);
        const own = records.filter((r) => r.studentId === enrollment.studentId);
        const perCourse = courses.map((course) => {
          const { summary, evaluation } = this.calculator.evaluate(
            own.filter((r) => r.subjectId === course.id),
            ctx,
          );
          return {
            subjectId: course.id,
            name: course.name,
            unjustifiedPct: summary.unjustifiedPct,
            absences: summary.absences,
            status: evaluation.status,
          };
        });
        const worstStatus = perCourse.reduce<AttendanceStatus>(
          (worst, c) => (STATUS_ORDER.indexOf(c.status) > STATUS_ORDER.indexOf(worst) ? c.status : worst),
          'OK',
        );
        return { studentId: enrollment.studentId, name: displayName(profile, enrollment.studentId), worstStatus, courses: perCourse };
      }),
    );
    return rows.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(b.worstStatus) - STATUS_ORDER.indexOf(a.worstStatus) ||
        a.name.localeCompare(b.name, 'es'),
    );
  }
}

// ── Para analítica (llamada interna) ─────────────────────────────────────────

@Injectable()
export class GetAttendanceRateUseCase {
  constructor(@Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository) {}

  /** % de clases a las que asistió según el docente; null si no hay registros. */
  async execute(studentId: string, subjectId: string): Promise<{ attendance: number; held: number } | null> {
    const records = await this.attendance.listRecords({ studentId, subjectId });
    if (records.length === 0) return null;
    const present = records.filter((r) => r.present).length;
    return { attendance: Math.round((present / records.length) * 100), held: records.length };
  }
}

// ── Justificaciones ──────────────────────────────────────────────────────────

@Injectable()
export class RequestJustificationUseCase {
  constructor(
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: AttendanceCalculator,
    private readonly notifier: AttendanceNotifier,
  ) {}

  async execute(studentId: string, dto: RequestJustificationDto, caller: Caller): Promise<{ id: string }> {
    if (!(await this.people.findGuardianLink(caller.id, studentId))) {
      throw new ForbiddenException('Solo un representante vinculado puede justificar faltas');
    }

    const session = await this.attendance.findSession(dto.sessionId);
    if (!session) throw new NotFoundException('La clase no existe');

    const record = (await this.attendance.listRecords({ studentId, subjectId: session.subjectId })).find(
      (r) => r.sessionId === session.id,
    );
    if (!record || record.present) {
      throw new BadRequestException('No hay una falta registrada para esa clase');
    }
    if (await this.attendance.findJustification(session.id, studentId)) {
      throw new ConflictException('Esa falta ya tiene una justificación');
    }

    const subject = await this.subjectRepo.findById(session.subjectId);
    const enrollment = (await this.studentEnrollments.listByStudent(studentId)).find((e) =>
      ACTIVE_STATES.includes(e.status),
    );
    if (enrollment) {
      const { rule } = await this.calculator.contextForSection(enrollment.sectionId);
      if (!isWithinJustificationWindow(session.sessionDate, todayInEcuador(), rule.justificationDays)) {
        throw new ConflictException(
          `Venció el plazo para justificar esta falta (${rule.justificationDays} día(s) desde la clase)`,
        );
      }
    }

    await this.profiles.getProfile(caller.id).catch(() => null);
    const id = randomUUID();
    await this.attendance.saveJustification({
      id,
      sessionId: session.id,
      studentId,
      requestedBy: caller.id,
      reason: dto.reason.trim(),
      status: 'PENDING',
      resolvedBy: null,
      resolvedAt: null,
      resolutionNote: null,
      createdAt: new Date(),
    });
    await this.notifier.notifyJustificationRequested(studentId, subject?.name ?? 'el curso', session.sessionDate);
    return { id };
  }
}

export interface JustificationView {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  sessionDate: string;
  reason: string;
  status: JustificationStatus;
  resolutionNote: string | null;
  createdAt: Date;
}

@Injectable()
export class ListJustificationsUseCase {
  constructor(
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  async execute(status: JustificationStatus | undefined, caller: Caller): Promise<JustificationView[]> {
    if (!AUTHORITY_ROLES.includes(caller.role) && !['SECRETARY', 'DECE'].includes(caller.role)) {
      throw new ForbiddenException('No tienes acceso a las justificaciones');
    }
    const list = await this.attendance.listJustifications({ status });
    return Promise.all(
      list.map(async (j) => {
        const [profile, subject] = await Promise.all([
          this.profiles.getProfile(j.studentId).catch(() => null),
          this.subjectRepo.findById(j.subjectId),
        ]);
        return {
          id: j.id,
          studentId: j.studentId,
          studentName: displayName(profile, j.studentId),
          courseName: subject?.name ?? '',
          sessionDate: j.sessionDate,
          reason: j.reason,
          status: j.status,
          resolutionNote: j.resolutionNote,
          createdAt: j.createdAt,
        };
      }),
    );
  }
}

@Injectable()
export class ResolveJustificationUseCase {
  constructor(
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly notifier: AttendanceNotifier,
  ) {}

  async execute(id: string, dto: ResolveJustificationDto, caller: Caller): Promise<void> {
    if (!AUTHORITY_ROLES.includes(caller.role)) {
      throw new ForbiddenException('Solo inspección o administración resuelven justificaciones');
    }
    const justification = await this.attendance.findJustificationById(id);
    if (!justification) throw new NotFoundException('Justificación no encontrada');
    if (justification.status !== 'PENDING') {
      throw new ConflictException('La justificación ya fue resuelta');
    }
    const note = dto.note?.trim() || null;
    if (!dto.approve && !note) {
      throw new BadRequestException('Indica el motivo del rechazo');
    }

    await this.profiles.getProfile(caller.id).catch(() => null);
    await this.attendance.saveJustification({
      ...justification,
      status: dto.approve ? 'APPROVED' : 'REJECTED',
      resolvedBy: caller.id,
      resolvedAt: new Date(),
      resolutionNote: note,
    });

    const subject = await this.subjectRepo.findById(justification.subjectId);
    await this.notifier.notifyJustificationResolved({
      studentId: justification.studentId,
      requestedBy: justification.requestedBy,
      courseName: subject?.name ?? 'el curso',
      date: justification.sessionDate,
      approved: dto.approve,
    });
  }
}
