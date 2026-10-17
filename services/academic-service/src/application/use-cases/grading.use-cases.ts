import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import {
  GradeActivity,
  GradingComponent,
  PeriodResult,
  PromotionDecision,
  PromotionSuggestion,
} from '../../domain/entities/grading.entity';
import { GradingScale } from '../../domain/entities/institution-config.entity';
import { StudentEnrollment } from '../../domain/entities/people.entity';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import {
  resolveSubjectResult,
  validateGradeValue,
  validateGradingComponents,
} from '../../domain/services/grading-rules';
import { qualitativeFor } from '../../domain/services/institution-rules';
import {
  ClosePeriodDto,
  ConfirmPromotionDto,
  CreateActivityDto,
  RegisterSupplementaryDto,
  ReopenPeriodDto,
  SaveGradesDto,
  UpdateActivityDto,
  UpdateGradingComponentsDto,
} from '../dtos/grading.dto';
import { todayInEcuador } from '../dtos/school-year.view';
import {
  CourseYearResult,
  GradingCalculator,
  StudentYearResult,
} from '../services/grading-calculator';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IAcademicStructureRepository } from '../ports/output/i-academic-structure.repository';
import { IAnalyticsClientPort } from '../ports/output/i-analytics-client.port';
import { IGradingRepository } from '../ports/output/i-grading.repository';
import { IInstitutionConfigRepository } from '../ports/output/i-institution-config.repository';
import { IPeopleRepository } from '../ports/output/i-people.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';
import { IStudentEnrollmentRepository } from '../ports/output/i-student-enrollment.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { Caller } from './people-enrollment.use-cases';

const STAFF_ROLES = ['ADMIN', 'SECRETARY'];
const ACTIVE_STATES = ['ACTIVE', 'PROMOTED', 'REPEATED'];

function failIfAny(errors: string[]): void {
  if (errors.length > 0) throw new BadRequestException(errors);
}

const displayName = (p: { firstName: string; lastName: string } | null, fallback: string) =>
  p ? `${p.firstName} ${p.lastName}`.trim() || fallback : fallback;

/** Registra al usuario en el espejo local, requisito de las claves foráneas. */
async function ensureReference(profiles: IUserProfilePort, userId: string): Promise<void> {
  await profiles.getProfile(userId).catch(() => null);
}

/** Asignatura de un paralelo; las del modelo anterior no usan este libro. */
async function loadSchoolCourse(subjectRepo: ISubjectRepository, subjectId: string): Promise<SubjectEntity> {
  const subject = await subjectRepo.findById(subjectId);
  if (!subject) throw new NotFoundException(`Asignatura '${subjectId}' no encontrada`);
  if (!subject.sectionId) {
    throw new BadRequestException('Esta asignatura no pertenece a un paralelo');
  }
  return subject;
}

/** El administrador califica cualquier curso; el docente solo los suyos. */
async function assertCanGrade(
  caller: Caller,
  subject: SubjectEntity,
  teachers: ISubjectTeacherRepository,
): Promise<void> {
  if (caller.role === 'ADMIN') return;
  if (caller.role === 'TEACHER') {
    if (subject.teacherId === caller.id) return;
    const assignment = await teachers.findBySubjectTeacherAndPeriod(
      subject.id,
      caller.id,
      subject.academicPeriodId,
    );
    if (assignment) return;
  }
  throw new ForbiddenException('No tienes acceso a este curso');
}

/** El periodo debe existir y pertenecer al año lectivo del curso. */
async function loadCoursePeriod(
  periodRepo: IAcademicPeriodRepository,
  structure: IAcademicStructureRepository,
  subject: SubjectEntity,
  periodId: string,
): Promise<AcademicPeriodEntity> {
  const [period, section] = await Promise.all([
    periodRepo.findById(periodId),
    structure.findSection(subject.sectionId as string),
  ]);
  if (!period) throw new NotFoundException(`Periodo '${periodId}' no encontrado`);
  if (!section || period.schoolYearId !== section.schoolYearId) {
    throw new BadRequestException('El periodo no pertenece al año lectivo de este curso');
  }
  return period;
}

function assertPeriodWritable(period: AcademicPeriodEntity, caller: Caller): void {
  if (period.isClosed) {
    throw new ConflictException(`El periodo '${period.name}' está cerrado. Pide a la administración que lo reabra.`);
  }
  if (caller.role === 'TEACHER' && period.gradesDueDate && todayInEcuador() > period.gradesDueDate) {
    throw new ConflictException(
      `Venció la fecha límite de registro de notas del periodo '${period.name}' (${period.gradesDueDate}). Pide a la administración que registre o corrija la nota.`,
    );
  }
}

// ── Componentes de la nota ───────────────────────────────────────────────────

@Injectable()
export class GetGradingComponentsUseCase {
  constructor(@Inject('IGradingRepository') private readonly grading: IGradingRepository) {}

  execute(): Promise<GradingComponent[]> {
    return this.grading.getComponents();
  }
}

@Injectable()
export class UpdateGradingComponentsUseCase {
  constructor(@Inject('IGradingRepository') private readonly grading: IGradingRepository) {}

  async execute(dto: UpdateGradingComponentsDto): Promise<GradingComponent[]> {
    const components: GradingComponent[] = dto.components.map((c, index) => ({
      code: c.code.trim().toUpperCase(),
      name: c.name.trim(),
      weight: c.weight,
      sortOrder: index + 1,
    }));
    const errors = validateGradingComponents(components);

    const codes = new Set(components.map((c) => c.code));
    const removed = (await this.grading.listUsedComponentCodes()).filter((code) => !codes.has(code));
    if (removed.length > 0) {
      errors.push(`No se pueden quitar componentes con actividades registradas: ${removed.join(', ')}`);
    }
    failIfAny(errors);

    return this.grading.replaceComponents(components);
  }
}

// ── Libro de calificaciones ──────────────────────────────────────────────────

export interface GradebookStudent {
  studentId: string;
  name: string;
  grades: Record<string, number>;
  componentAverages: Record<string, number | null>;
  periodGrade: number | null;
  bandCode: string | null;
  isComplete: boolean;
}

export interface GradebookView {
  subject: { id: string; name: string; code: string };
  period: { id: string; name: string; number: number | null; isClosed: boolean; gradesDueDate: string | null };
  /** Todos los periodos del año lectivo del curso, para cambiar de uno a otro. */
  periods: Array<{ id: string; name: string; number: number | null; isClosed: boolean }>;
  scale: Pick<GradingScale, 'minValue' | 'maxValue' | 'passingGrade' | 'decimals' | 'bands'>;
  components: GradingComponent[];
  activities: Array<GradeActivity & { gradeCount: number }>;
  students: GradebookStudent[];
}

const isoDate = (value: Date | string): string =>
  typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);

/** El periodo en curso por fechas; si no hay, el activo; si no, el primero. */
function pickDefaultPeriod(periods: AcademicPeriodEntity[]): AcademicPeriodEntity | undefined {
  const today = todayInEcuador();
  return (
    periods.find((p) => isoDate(p.startDate) <= today && today <= isoDate(p.endDate)) ??
    periods.find((p) => p.isActive) ??
    periods[0]
  );
}

@Injectable()
export class GetGradebookUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly teachers: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  async execute(subjectId: string, periodId: string | undefined, caller: Caller): Promise<GradebookView> {
    const subject = await loadSchoolCourse(this.subjectRepo, subjectId);
    await assertCanGrade(caller, subject, this.teachers);

    const section = await this.structure.findSection(subject.sectionId as string);
    const periods = section ? await this.periodRepo.findBySchoolYear(section.schoolYearId) : [];
    const chosen = periodId ? periods.find((p) => p.id === periodId) : pickDefaultPeriod(periods);
    if (!chosen) {
      throw new NotFoundException(
        periodId ? 'El periodo no pertenece al año lectivo de este curso' : 'El año lectivo no tiene periodos',
      );
    }
    const period = chosen;

    const [activities, computed] = await Promise.all([
      this.grading.listActivities(subjectId, period.id),
      this.calculator.coursePeriod(subjectId, period.id),
    ]);
    const { config, studentIds, rows, byStudent } = computed;
    const active = activities.filter((a) => a.isActive);

    const students: GradebookStudent[] = await Promise.all(
      studentIds.map(async (studentId) => {
        const profile = await this.profiles.getProfile(studentId).catch(() => null);
        const result = byStudent.get(studentId);
        const value = result?.value ?? null;
        return {
          studentId,
          name: displayName(profile, studentId),
          grades: Object.fromEntries(
            rows.filter((r) => r.studentId === studentId).map((r) => [r.activityId, r.value]),
          ),
          componentAverages: result?.componentAverages ?? {},
          periodGrade: value,
          bandCode: value === null ? null : (qualitativeFor(config.scale, value)?.code ?? null),
          isComplete: result?.isComplete ?? false,
        };
      }),
    );
    students.sort((a, b) => a.name.localeCompare(b.name, 'es'));

    return {
      subject: { id: subject.id, name: subject.name, code: subject.code },
      period: {
        id: period.id,
        name: period.name,
        number: period.number,
        isClosed: period.isClosed,
        gradesDueDate: period.gradesDueDate,
      },
      periods: periods.map((p) => ({ id: p.id, name: p.name, number: p.number, isClosed: p.isClosed })),
      scale: {
        minValue: config.scale.minValue,
        maxValue: config.scale.maxValue,
        passingGrade: config.scale.passingGrade,
        decimals: config.scale.decimals,
        bands: config.scale.bands,
      },
      components: config.components,
      activities: active.map((a) => ({
        ...a,
        gradeCount: rows.filter((r) => r.activityId === a.id).length,
      })),
      students,
    };
  }
}

@Injectable()
export class CreateActivityUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly teachers: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
  ) {}

  async execute(subjectId: string, dto: CreateActivityDto, caller: Caller): Promise<GradeActivity> {
    const subject = await loadSchoolCourse(this.subjectRepo, subjectId);
    await assertCanGrade(caller, subject, this.teachers);
    const period = await loadCoursePeriod(this.periodRepo, this.structure, subject, dto.periodId);
    assertPeriodWritable(period, caller);

    const componentCode = dto.componentCode.trim().toUpperCase();
    const components = await this.grading.getComponents();
    if (!components.some((c) => c.code === componentCode)) {
      throw new BadRequestException(`Componente desconocido: ${componentCode}`);
    }
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('El nombre de la actividad es obligatorio');

    return this.grading.saveActivity({
      id: randomUUID(),
      subjectId,
      periodId: period.id,
      componentCode,
      name,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      isActive: true,
    });
  }
}

/** Carga una actividad con su asignatura y comprueba permisos y periodo abierto. */
async function loadWritableActivity(
  activityId: string,
  caller: Caller,
  deps: {
    grading: IGradingRepository;
    subjectRepo: ISubjectRepository;
    teachers: ISubjectTeacherRepository;
    periodRepo: IAcademicPeriodRepository;
  },
): Promise<GradeActivity> {
  const activity = await deps.grading.findActivity(activityId);
  if (!activity) throw new NotFoundException(`Actividad '${activityId}' no encontrada`);

  const subject = await loadSchoolCourse(deps.subjectRepo, activity.subjectId);
  await assertCanGrade(caller, subject, deps.teachers);

  const period = await deps.periodRepo.findById(activity.periodId);
  if (!period) throw new NotFoundException('Periodo de la actividad no encontrado');
  assertPeriodWritable(period, caller);
  return activity;
}

@Injectable()
export class UpdateActivityUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly teachers: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
  ) {}

  async execute(activityId: string, dto: UpdateActivityDto, caller: Caller): Promise<GradeActivity> {
    const activity = await loadWritableActivity(activityId, caller, {
      grading: this.grading,
      subjectRepo: this.subjectRepo,
      teachers: this.teachers,
      periodRepo: this.periodRepo,
    });

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) throw new BadRequestException('El nombre de la actividad es obligatorio');
      activity.name = name;
    }
    if (dto.componentCode !== undefined) {
      const code = dto.componentCode.trim().toUpperCase();
      const components = await this.grading.getComponents();
      if (!components.some((c) => c.code === code)) {
        throw new BadRequestException(`Componente desconocido: ${code}`);
      }
      activity.componentCode = code;
    }
    if (dto.dueDate !== undefined) {
      activity.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    return this.grading.saveActivity(activity);
  }
}

@Injectable()
export class ToggleActivityUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly teachers: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
  ) {}

  /** Archivar oculta la actividad del cálculo sin borrar sus notas. */
  async execute(activityId: string, isActive: boolean, caller: Caller): Promise<GradeActivity> {
    const activity = await loadWritableActivity(activityId, caller, {
      grading: this.grading,
      subjectRepo: this.subjectRepo,
      teachers: this.teachers,
      periodRepo: this.periodRepo,
    });
    activity.isActive = isActive;
    return this.grading.saveActivity(activity);
  }
}

export interface SaveGradesResult {
  created: number;
  updated: number;
  unchanged: number;
}

@Injectable()
export class SaveGradesUseCase {
  private readonly logger = new Logger(SaveGradesUseCase.name);

  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly teachers: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IInstitutionConfigRepository') private readonly config: IInstitutionConfigRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    @Inject('IAnalyticsClientPort') private readonly analytics: IAnalyticsClientPort,
  ) {}

  async execute(subjectId: string, dto: SaveGradesDto, caller: Caller): Promise<SaveGradesResult> {
    const subject = await loadSchoolCourse(this.subjectRepo, subjectId);
    await assertCanGrade(caller, subject, this.teachers);
    const period = await loadCoursePeriod(this.periodRepo, this.structure, subject, dto.periodId);
    assertPeriodWritable(period, caller);

    const [scale, activities, studentIds] = await Promise.all([
      this.config.getGradingScale(),
      this.grading.listActivities(subjectId, period.id),
      this.grading.listActiveStudentIds(subjectId),
    ]);
    const activeActivities = new Set(activities.filter((a) => a.isActive).map((a) => a.id));
    const roster = new Set(studentIds);

    const errors: string[] = [];
    dto.entries.forEach((entry, index) => {
      const row = `Fila ${index + 1}`;
      if (!activeActivities.has(entry.activityId)) {
        errors.push(`${row}: la actividad no existe, está archivada o es de otro periodo`);
      }
      if (!roster.has(entry.studentId)) {
        errors.push(`${row}: el estudiante no está matriculado en este curso`);
      }
      const invalid = validateGradeValue(scale, entry.value);
      if (invalid) errors.push(`${row}: ${invalid}`);
    });
    failIfAny(errors);

    await ensureReference(this.profiles, caller.id);
    const result = await this.grading.upsertGrades(
      dto.entries.map((e) => ({ ...e, subjectId })),
      caller.id,
    );

    // Dispara el recálculo de analítica sin bloquear la respuesta.
    const changed = [...new Set(dto.entries.map((e) => e.studentId))];
    this.analytics
      .triggerRecalculate(subjectId, subject.academicPeriodId, changed)
      .catch((err) =>
        this.logger.error(`Analytics trigger failed: ${err instanceof Error ? err.message : String(err)}`),
      );

    return result;
  }
}

// ── Cierre de periodos ───────────────────────────────────────────────────────

export interface PeriodClosureCourse {
  subjectId: string;
  name: string;
  sectionLabel: string;
  students: number;
  incomplete: number;
}

export interface PeriodClosureView {
  period: {
    id: string;
    name: string;
    number: number | null;
    schoolYearId: string | null;
    isClosed: boolean;
    closedAt: Date | null;
  };
  events: Array<{
    id: string;
    action: 'CLOSE' | 'REOPEN';
    reason: string | null;
    performedBy: string;
    performedByName: string;
    performedAt: Date;
  }>;
  courses: PeriodClosureCourse[];
  totals: { courses: number; students: number; incomplete: number };
}

async function sectionLabels(
  structure: IAcademicStructureRepository,
  schoolYearId: string,
): Promise<Map<string, string>> {
  const [sections, levels] = await Promise.all([
    structure.listSections({ schoolYearId }),
    structure.listGradeLevels(),
  ]);
  const levelNames = new Map(levels.map((l) => [l.code, l.name]));
  return new Map(
    sections.map((s) => [s.id, `${levelNames.get(s.gradeLevelCode) ?? s.gradeLevelCode} «${s.name}»`]),
  );
}

/** Recorre las asignaturas del año y calcula la nota del periodo de cada estudiante. */
async function scanPeriod(
  calculator: GradingCalculator,
  grading: IGradingRepository,
  structure: IAcademicStructureRepository,
  period: AcademicPeriodEntity,
) {
  const schoolYearId = period.schoolYearId as string;
  const [courses, labels, config] = await Promise.all([
    grading.listSchoolYearCourses(schoolYearId),
    sectionLabels(structure, schoolYearId),
    calculator.loadConfig(),
  ]);

  const summary: PeriodClosureCourse[] = [];
  const results: PeriodResult[] = [];
  const closedAt = new Date();

  for (const course of courses) {
    const { studentIds, byStudent } = await calculator.coursePeriod(course.id, period.id, config);
    if (studentIds.length === 0) continue;

    let incomplete = 0;
    for (const studentId of studentIds) {
      const grade = byStudent.get(studentId);
      const complete = grade?.isComplete ?? false;
      if (!complete) incomplete++;
      const value = complete ? (grade?.value ?? null) : null;
      results.push({
        periodId: period.id,
        subjectId: course.id,
        studentId,
        value,
        isComplete: complete,
        bandCode: value === null ? null : (qualitativeFor(config.scale, value)?.code ?? null),
        closedAt,
      });
    }
    summary.push({
      subjectId: course.id,
      name: course.name,
      sectionLabel: labels.get(course.sectionId) ?? '',
      students: studentIds.length,
      incomplete,
    });
  }
  return { summary, results };
}

@Injectable()
export class GetPeriodClosureUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  async execute(periodId: string): Promise<PeriodClosureView> {
    const period = await this.periodRepo.findById(periodId);
    if (!period || !period.schoolYearId) {
      throw new NotFoundException(`Periodo '${periodId}' no encontrado`);
    }

    const [{ summary }, events] = await Promise.all([
      scanPeriod(this.calculator, this.grading, this.structure, period),
      this.grading.listClosureEvents(periodId),
    ]);

    const names = new Map<string, string>();
    for (const userId of new Set(events.map((e) => e.performedBy))) {
      const profile = await this.profiles.getProfile(userId).catch(() => null);
      names.set(userId, displayName(profile, userId));
    }

    return {
      period: {
        id: period.id,
        name: period.name,
        number: period.number,
        schoolYearId: period.schoolYearId,
        isClosed: period.isClosed,
        closedAt: period.closedAt,
      },
      events: events.map((e) => ({
        id: e.id,
        action: e.action,
        reason: e.reason,
        performedBy: e.performedBy,
        performedByName: names.get(e.performedBy) ?? e.performedBy,
        performedAt: e.performedAt,
      })),
      courses: summary,
      totals: {
        courses: summary.length,
        students: summary.reduce((sum, c) => sum + c.students, 0),
        incomplete: summary.reduce((sum, c) => sum + c.incomplete, 0),
      },
    };
  }
}

@Injectable()
export class ClosePeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  async execute(periodId: string, dto: ClosePeriodDto, caller: Caller): Promise<PeriodClosureView['totals']> {
    const period = await this.periodRepo.findById(periodId);
    if (!period || !period.schoolYearId) {
      throw new NotFoundException(`Periodo '${periodId}' no encontrado`);
    }
    if (period.isClosed) throw new ConflictException('El periodo ya está cerrado');

    const { summary, results } = await scanPeriod(this.calculator, this.grading, this.structure, period);
    const incomplete = summary.reduce((sum, c) => sum + c.incomplete, 0);
    if (incomplete > 0 && !dto.allowIncomplete) {
      const courses = summary.filter((c) => c.incomplete > 0).length;
      throw new ConflictException(
        `Hay ${incomplete} estudiante(s) sin nota completa en ${courses} asignatura(s). Revísalo o cierra el periodo aceptando notas incompletas.`,
      );
    }

    await ensureReference(this.profiles, caller.id);
    await this.grading.closePeriod(period.id, caller.id, results, {
      id: randomUUID(),
      periodId: period.id,
      action: 'CLOSE',
      reason: incomplete > 0 ? `Cierre con ${incomplete} nota(s) incompleta(s)` : null,
      performedBy: caller.id,
      performedAt: new Date(),
    });

    return {
      courses: summary.length,
      students: summary.reduce((sum, c) => sum + c.students, 0),
      incomplete,
    };
  }
}

@Injectable()
export class ReopenPeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('ISchoolYearRepository') private readonly schoolYears: ISchoolYearRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  async execute(periodId: string, dto: ReopenPeriodDto, caller: Caller): Promise<void> {
    const period = await this.periodRepo.findById(periodId);
    if (!period) throw new NotFoundException(`Periodo '${periodId}' no encontrado`);
    if (!period.isClosed) throw new ConflictException('El periodo no está cerrado');

    const year = period.schoolYearId ? await this.schoolYears.findById(period.schoolYearId) : null;
    if (year?.status === 'FINISHED') {
      throw new ConflictException('No se puede reabrir un periodo de un año lectivo finalizado');
    }

    await ensureReference(this.profiles, caller.id);
    await this.grading.reopenPeriod(period.id, {
      id: randomUUID(),
      periodId: period.id,
      action: 'REOPEN',
      reason: dto.reason.trim(),
      performedBy: caller.id,
      performedAt: new Date(),
    });
  }
}

// ── Resultados del estudiante ────────────────────────────────────────────────

export interface StudentResultsView {
  studentId: string;
  studentName: string;
  schoolYear: { id: string; name: string };
  enrollment: { id: string; sectionId: string; sectionLabel: string; status: string };
  scale: Pick<GradingScale, 'minValue' | 'maxValue' | 'passingGrade' | 'decimals' | 'bands'>;
  result: StudentYearResult;
  decision: PromotionDecision | null;
}

@Injectable()
export class GetStudentResultsUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('ISchoolYearRepository') private readonly schoolYears: ISchoolYearRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  async execute(studentId: string, schoolYearId: string | undefined, caller: Caller): Promise<StudentResultsView> {
    const allowed =
      STAFF_ROLES.includes(caller.role) ||
      (caller.role === 'STUDENT' && caller.id === studentId) ||
      (caller.role === 'GUARDIAN' && Boolean(await this.people.findGuardianLink(caller.id, studentId)));
    if (!allowed) throw new ForbiddenException('No tienes acceso a las notas de este estudiante');

    const enrollments = (await this.studentEnrollments.listByStudent(studentId)).filter((e) =>
      ACTIVE_STATES.includes(e.status),
    );
    let enrollment: StudentEnrollment | undefined;
    if (schoolYearId) {
      enrollment = enrollments.find((e) => e.schoolYearId === schoolYearId);
    } else {
      const active = await this.schoolYears.findActive();
      enrollment = enrollments.find((e) => e.schoolYearId === active?.id) ?? enrollments[0];
    }
    if (!enrollment) throw new NotFoundException('El estudiante no tiene matrícula en el año lectivo indicado');

    const [year, labels, ctx, profile, decision] = await Promise.all([
      this.schoolYears.findById(enrollment.schoolYearId),
      sectionLabels(this.structure, enrollment.schoolYearId),
      this.calculator.buildSectionContext(enrollment.sectionId),
      this.profiles.getProfile(studentId).catch(() => null),
      this.grading.getDecision(enrollment.id),
    ]);
    const result = await this.calculator.studentYear(enrollment, ctx);
    const { scale } = ctx.config;

    return {
      studentId,
      studentName: displayName(profile, studentId),
      schoolYear: { id: enrollment.schoolYearId, name: year?.name ?? '' },
      enrollment: {
        id: enrollment.id,
        sectionId: enrollment.sectionId,
        sectionLabel: labels.get(enrollment.sectionId) ?? '',
        status: enrollment.status,
      },
      scale: {
        minValue: scale.minValue,
        maxValue: scale.maxValue,
        passingGrade: scale.passingGrade,
        decimals: scale.decimals,
        bands: scale.bands,
      },
      result,
      decision,
    };
  }
}

// ── Supletorio ───────────────────────────────────────────────────────────────

export interface SupplementaryCandidate {
  studentId: string;
  studentName: string;
  annualAverage: number;
  supplementaryGrade: number | null;
  status: CourseYearResult['status'];
}

@Injectable()
export class ListSupplementaryCandidatesUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly teachers: ISubjectTeacherRepository,
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  /** Estudiantes del curso que deben o ya rindieron supletorio. */
  async execute(subjectId: string, caller: Caller): Promise<SupplementaryCandidate[]> {
    const subject = await loadSchoolCourse(this.subjectRepo, subjectId);
    await assertCanGrade(caller, subject, this.teachers);

    const sectionId = subject.sectionId as string;
    const ctx = await this.calculator.buildSectionContext(sectionId);
    const enrollments = (await this.studentEnrollments.listBySection(sectionId)).filter((e) =>
      ACTIVE_STATES.includes(e.status),
    );

    const candidates: SupplementaryCandidate[] = [];
    for (const enrollment of enrollments) {
      const year = await this.calculator.studentYear(enrollment, ctx);
      const course = year.courses.find((c) => c.subjectId === subjectId);
      if (!course || course.annualAverage === null) continue;

      const base = resolveSubjectResult({
        annualAverage: course.annualAverage,
        supplementaryGrade: null,
        rule: ctx.rule,
        scale: ctx.config.scale,
      });
      if (base.status !== 'SUPPLEMENTARY_PENDING') continue;

      const profile = await this.profiles.getProfile(enrollment.studentId).catch(() => null);
      candidates.push({
        studentId: enrollment.studentId,
        studentName: displayName(profile, enrollment.studentId),
        annualAverage: course.annualAverage,
        supplementaryGrade: course.supplementaryGrade,
        status: course.status,
      });
    }
    return candidates.sort((a, b) => a.studentName.localeCompare(b.studentName, 'es'));
  }
}

@Injectable()
export class RegisterSupplementaryUseCase {
  constructor(
    private readonly listCandidates: ListSupplementaryCandidatesUseCase,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IInstitutionConfigRepository') private readonly config: IInstitutionConfigRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  async execute(subjectId: string, dto: RegisterSupplementaryDto, caller: Caller): Promise<{ saved: number }> {
    const candidates = await this.listCandidates.execute(subjectId, caller);
    const eligible = new Set(candidates.map((c) => c.studentId));
    const scale = await this.config.getGradingScale();

    const errors: string[] = [];
    dto.entries.forEach((entry, index) => {
      if (!eligible.has(entry.studentId)) {
        errors.push(`Fila ${index + 1}: el estudiante no requiere supletorio en esta asignatura`);
      }
      const invalid = validateGradeValue(scale, entry.value);
      if (invalid) errors.push(`Fila ${index + 1}: ${invalid}`);
    });
    failIfAny(errors);

    await ensureReference(this.profiles, caller.id);
    const now = new Date();
    await this.grading.upsertSupplementary(
      dto.entries.map((e) => ({
        subjectId,
        studentId: e.studentId,
        value: e.value,
        registeredBy: caller.id,
        registeredAt: now,
      })),
    );
    return { saved: dto.entries.length };
  }
}

// ── Promoción ────────────────────────────────────────────────────────────────

export interface SectionPromotionRow {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  enrollmentStatus: string;
  suggestion: PromotionSuggestion;
  reasons: string[];
  courses: Array<Pick<CourseYearResult, 'subjectId' | 'name' | 'annualAverage' | 'supplementaryGrade' | 'finalGrade' | 'status'>>;
  decision: PromotionDecision | null;
}

@Injectable()
export class GetSectionPromotionUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  async execute(sectionId: string): Promise<SectionPromotionRow[]> {
    const ctx = await this.calculator.buildSectionContext(sectionId);
    const enrollments = (await this.studentEnrollments.listBySection(sectionId)).filter((e) =>
      ACTIVE_STATES.includes(e.status),
    );
    const decisions = await this.grading.listDecisions(enrollments.map((e) => e.id));

    const rows: SectionPromotionRow[] = [];
    for (const enrollment of enrollments) {
      const [year, profile] = await Promise.all([
        this.calculator.studentYear(enrollment, ctx),
        this.profiles.getProfile(enrollment.studentId).catch(() => null),
      ]);
      rows.push({
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        studentName: displayName(profile, enrollment.studentId),
        enrollmentStatus: enrollment.status,
        suggestion: year.suggestion,
        reasons: year.reasons,
        courses: year.courses.map((c) => ({
          subjectId: c.subjectId,
          name: c.name,
          annualAverage: c.annualAverage,
          supplementaryGrade: c.supplementaryGrade,
          finalGrade: c.finalGrade,
          status: c.status,
        })),
        decision: decisions.find((d) => d.studentEnrollmentId === enrollment.id) ?? null,
      });
    }
    return rows.sort((a, b) => a.studentName.localeCompare(b.studentName, 'es'));
  }
}

export interface PromotionConfirmResult {
  studentEnrollmentId: string;
  ok: boolean;
  errors: string[];
}

@Injectable()
export class ConfirmPromotionUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
    private readonly calculator: GradingCalculator,
  ) {}

  async execute(sectionId: string, dto: ConfirmPromotionDto, caller: Caller): Promise<PromotionConfirmResult[]> {
    const ctx = await this.calculator.buildSectionContext(sectionId);
    await ensureReference(this.profiles, caller.id);

    const results: PromotionConfirmResult[] = [];
    for (const entry of dto.decisions) {
      const fail = (message: string) =>
        results.push({ studentEnrollmentId: entry.studentEnrollmentId, ok: false, errors: [message] });

      const enrollment = await this.studentEnrollments.findById(entry.studentEnrollmentId);
      if (!enrollment || enrollment.sectionId !== sectionId) {
        fail('La matrícula no pertenece a este paralelo');
        continue;
      }
      if (!ACTIVE_STATES.includes(enrollment.status)) {
        fail('La matrícula ya no admite decisión de promoción');
        continue;
      }

      const year = await this.calculator.studentYear(enrollment, ctx);
      if (year.suggestion === 'PENDING' || year.suggestion === 'PENDING_SUPPLEMENTARY') {
        fail(`Aún no se puede decidir: ${year.reasons.join('; ') || 'faltan notas'}`);
        continue;
      }

      const notes = entry.notes?.trim() || null;
      const isOverride =
        year.suggestion !== 'REVIEW' && year.suggestion !== entry.outcome;
      if ((isOverride || year.suggestion === 'REVIEW') && (notes?.length ?? 0) < 5) {
        fail('Registra el motivo de la decisión (mínimo 5 caracteres)');
        continue;
      }

      await this.grading.saveDecision({
        studentEnrollmentId: enrollment.id,
        outcome: entry.outcome,
        suggested: year.suggestion,
        isOverride,
        notes,
        decidedBy: caller.id,
        decidedAt: new Date(),
      });
      results.push({ studentEnrollmentId: enrollment.id, ok: true, errors: [] });
    }
    return results;
  }
}
