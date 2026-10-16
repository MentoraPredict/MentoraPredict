import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CurriculumSubject,
  GradeLevel,
  Section,
  SectionSummary,
} from '../../domain/entities/academic-structure.entity';
import { SubjectCatalogEntity } from '../../domain/entities/subject-catalog.entity';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { SubjectTeacherEntity } from '../../domain/entities/subject-teacher.entity';
import {
  pickAnchorPeriod,
  planCourseGeneration,
  validateCurriculum,
  validateSection,
} from '../../domain/services/academic-structure';
import { toIsoDate } from '../../domain/services/school-calendar';
import {
  AssignCourseTeacherDto,
  CreateSectionCourseDto,
  CreateSectionDto,
  SetCurriculumDto,
  UpdateSectionDto,
  UpdateSubjectCatalogDto,
} from '../dtos/academic-structure.dto';
import { todayInEcuador } from '../dtos/school-year.view';
import { enrollStudentInCourses } from './people-enrollment.use-cases';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IStudentEnrollmentRepository } from '../ports/output/i-student-enrollment.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IAcademicStructureRepository } from '../ports/output/i-academic-structure.repository';
import { IInstitutionConfigRepository } from '../ports/output/i-institution-config.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';
import { ISubjectCatalogRepository } from '../ports/output/i-subject-catalog.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { ITeacherRolePort } from '../ports/output/i-teacher-role.port';

function failIfAny(errors: string[]): void {
  if (errors.length > 0) throw new BadRequestException(errors);
}

export interface GradeLevelView extends GradeLevel {
  levelName: string;
  isLevelActive: boolean;
  shifts: string[];
}

@Injectable()
export class ListGradeLevelsUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
    @Inject('IInstitutionConfigRepository')
    private readonly configRepo: IInstitutionConfigRepository,
  ) {}

  async execute(): Promise<GradeLevelView[]> {
    const [grades, catalog, levels] = await Promise.all([
      this.repo.listGradeLevels(),
      this.configRepo.listLevelCatalog(),
      this.configRepo.getLevels(),
    ]);
    const names = new Map(catalog.map((l) => [l.code, l.name]));
    const offered = new Map(levels.map((l) => [l.levelCode, l]));

    return grades.map((g) => ({
      ...g,
      levelName: names.get(g.levelCode) ?? g.levelCode,
      isLevelActive: offered.get(g.levelCode)?.isActive ?? false,
      shifts: offered.get(g.levelCode)?.shifts ?? [],
    }));
  }
}

@Injectable()
export class ListSectionsUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
  ) {}

  execute(filters: { schoolYearId?: string; gradeLevelCode?: string }): Promise<SectionSummary[]> {
    return this.repo.listSections(filters);
  }
}

@Injectable()
export class CreateSectionUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IInstitutionConfigRepository')
    private readonly configRepo: IInstitutionConfigRepository,
    @Inject('ITeacherRolePort')
    private readonly teacherRole: ITeacherRolePort,
  ) {}

  async execute(dto: CreateSectionDto): Promise<Section> {
    const year = await this.yearRepo.findById(dto.schoolYearId);
    if (!year) throw new NotFoundException(`Año lectivo '${dto.schoolYearId}' no encontrado`);
    if (year.status === 'FINISHED') {
      throw new ConflictException('No se pueden crear paralelos en un año lectivo finalizado');
    }

    const grade = await this.repo.findGradeLevel(dto.gradeLevelCode);
    if (!grade) throw new NotFoundException(`Grado '${dto.gradeLevelCode}' no encontrado`);

    const levels = await this.configRepo.getLevels();
    failIfAny(
      validateSection(dto, levels.find((l) => l.levelCode === grade.levelCode)),
    );

    const name = dto.name.trim().toUpperCase();
    if (await this.repo.findSectionByKey(dto.schoolYearId, dto.gradeLevelCode, name)) {
      throw new ConflictException(`Ya existe el paralelo '${name}' en ese grado y año lectivo`);
    }
    await assertTutor(this.teacherRole, dto.tutorId);

    return this.repo.saveSection({
      id: randomUUID(),
      schoolYearId: dto.schoolYearId,
      gradeLevelCode: dto.gradeLevelCode,
      name,
      shift: dto.shift,
      capacity: dto.capacity,
      tutorId: dto.tutorId ?? null,
      isActive: true,
    });
  }
}

async function assertTutor(port: ITeacherRolePort, tutorId?: string | null): Promise<void> {
  if (tutorId && !(await port.isTeacher(tutorId))) {
    throw new BadRequestException('El docente tutor no tiene rol TEACHER');
  }
}

@Injectable()
export class UpdateSectionUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
    @Inject('IInstitutionConfigRepository')
    private readonly configRepo: IInstitutionConfigRepository,
    @Inject('ITeacherRolePort')
    private readonly teacherRole: ITeacherRolePort,
  ) {}

  async execute(id: string, dto: UpdateSectionDto): Promise<Section> {
    const section = await this.repo.findSection(id);
    if (!section) throw new NotFoundException(`Paralelo '${id}' no encontrado`);

    const next: Section = {
      ...section,
      name: dto.name?.trim().toUpperCase() ?? section.name,
      shift: dto.shift ?? section.shift,
      capacity: dto.capacity ?? section.capacity,
      tutorId: dto.tutorId === undefined ? section.tutorId : dto.tutorId,
      isActive: dto.isActive ?? section.isActive,
    };

    const grade = await this.repo.findGradeLevel(section.gradeLevelCode);
    const levels = await this.configRepo.getLevels();
    failIfAny(
      validateSection(next, levels.find((l) => l.levelCode === grade?.levelCode)),
    );

    if (next.name !== section.name) {
      const clash = await this.repo.findSectionByKey(section.schoolYearId, section.gradeLevelCode, next.name);
      if (clash) throw new ConflictException(`Ya existe el paralelo '${next.name}' en ese grado y año lectivo`);
    }
    if (next.tutorId !== section.tutorId) {
      await assertTutor(this.teacherRole, next.tutorId);
    }
    return this.repo.saveSection(next);
  }
}

@Injectable()
export class DeleteSectionUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
  ) {}

  async execute(id: string): Promise<void> {
    if (!(await this.repo.findSection(id))) {
      throw new NotFoundException(`Paralelo '${id}' no encontrado`);
    }
    if ((await this.repo.countSectionCourses(id)) > 0) {
      throw new ConflictException('El paralelo tiene cursos asociados y no se puede eliminar');
    }
    await this.repo.deleteSection(id);
  }
}

@Injectable()
export class GetCurriculumUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
  ) {}

  async execute(gradeLevelCode: string): Promise<CurriculumSubject[]> {
    if (!(await this.repo.findGradeLevel(gradeLevelCode))) {
      throw new NotFoundException(`Grado '${gradeLevelCode}' no encontrado`);
    }
    return this.repo.getCurriculum(gradeLevelCode);
  }
}

@Injectable()
export class SetCurriculumUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
  ) {}

  async execute(gradeLevelCode: string, dto: SetCurriculumDto): Promise<CurriculumSubject[]> {
    if (!(await this.repo.findGradeLevel(gradeLevelCode))) {
      throw new NotFoundException(`Grado '${gradeLevelCode}' no encontrado`);
    }
    const items: CurriculumSubject[] = dto.items.map((i) => ({
      gradeLevelCode,
      subjectCatalogId: i.subjectCatalogId,
      weeklyHours: i.weeklyHours,
    }));
    failIfAny(validateCurriculum(items));

    for (const item of items) {
      const catalog = await this.catalogRepo.findById(item.subjectCatalogId);
      if (!catalog || !catalog.isActive) {
        throw new BadRequestException(
          `La asignatura '${item.subjectCatalogId}' no existe o está inactiva`,
        );
      }
    }
    return this.repo.replaceCurriculum(gradeLevelCode, items);
  }
}

/** Crea la fila de `subjects` que representa una asignatura de un paralelo. */
async function buildOffering(args: {
  section: Section;
  catalog: SubjectCatalogEntity;
  anchorPeriodId: string;
  teacherId: string | null;
  weeklyHours: number | null;
  subjectRepo: ISubjectRepository;
  subjectTeacherRepo: ISubjectTeacherRepository;
}): Promise<SubjectEntity> {
  const now = new Date();
  const saved = await args.subjectRepo.save(
    new SubjectEntity(
      randomUUID(),
      args.catalog.name,
      args.catalog.description,
      args.catalog.code,
      args.catalog.credits,
      args.catalog.careerId,
      args.anchorPeriodId,
      args.section.capacity,
      args.teacherId,
      true,
      now,
      now,
      null,
      args.catalog.id,
      args.section.id,
      args.weeklyHours,
    ),
  );
  if (args.teacherId) {
    await args.subjectTeacherRepo.save(
      new SubjectTeacherEntity(saved.id, args.teacherId, args.anchorPeriodId),
    );
  }
  return saved;
}

async function resolveAnchorPeriodId(
  yearRepo: ISchoolYearRepository,
  periodRepo: IAcademicPeriodRepository,
  schoolYearId: string,
): Promise<string> {
  const year = await yearRepo.findById(schoolYearId);
  if (!year) throw new NotFoundException(`Año lectivo '${schoolYearId}' no encontrado`);
  if (year.status === 'FINISHED') {
    throw new ConflictException('El año lectivo del paralelo está finalizado');
  }

  const periods = await periodRepo.findBySchoolYear(schoolYearId);
  const anchor = pickAnchorPeriod(
    periods.map((p) => ({
      id: p.id,
      startDate: toIsoDate(p.startDate),
      endDate: toIsoDate(p.endDate),
    })),
    todayInEcuador(),
  );
  if (!anchor) {
    throw new ConflictException('El año lectivo no tiene periodos de calificación');
  }
  return anchor.id;
}

export interface GenerateCoursesResult {
  created: number;
  alreadyOffered: number;
  courses: { id: string; name: string; weeklyHours: number | null }[];
}

@Injectable()
export class GenerateSectionCoursesUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IStudentEnrollmentRepository')
    private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(sectionId: string): Promise<GenerateCoursesResult> {
    const section = await this.repo.findSection(sectionId);
    if (!section) throw new NotFoundException(`Paralelo '${sectionId}' no encontrado`);
    if (!section.isActive) throw new ConflictException('El paralelo está inactivo');

    const curriculum = await this.repo.getCurriculum(section.gradeLevelCode);
    if (curriculum.length === 0) {
      throw new ConflictException('El grado no tiene una malla curricular definida');
    }

    const anchorPeriodId = await resolveAnchorPeriodId(this.yearRepo, this.periodRepo, section.schoolYearId);
    const offered = new Set(await this.repo.listOfferedCatalogIds(sectionId));
    const plan = planCourseGeneration(curriculum, offered);

    const courses: GenerateCoursesResult['courses'] = [];
    for (const item of plan.toCreate) {
      const catalog = await this.catalogRepo.findById(item.subjectCatalogId);
      if (!catalog || !catalog.isActive) continue;

      const saved = await buildOffering({
        section,
        catalog,
        anchorPeriodId,
        teacherId: null,
        weeklyHours: item.weeklyHours,
        subjectRepo: this.subjectRepo,
        subjectTeacherRepo: this.subjectTeacherRepo,
      });
      courses.push({ id: saved.id, name: saved.name, weeklyHours: saved.weeklyHours });
    }

    // Los estudiantes ya matriculados en el paralelo entran a los cursos nuevos.
    if (courses.length > 0) {
      const created = courses.map((c) => ({ id: c.id, academicPeriodId: anchorPeriodId }));
      const active = await this.studentEnrollments.listBySection(sectionId, 'ACTIVE');
      for (const enrollment of active) {
        await enrollStudentInCourses(enrollment.studentId, created, this.enrollmentRepo);
      }
    }

    return { created: courses.length, alreadyOffered: plan.alreadyOffered, courses };
  }
}

@Injectable()
export class CreateSectionCourseUseCase {
  constructor(
    @Inject('IAcademicStructureRepository')
    private readonly repo: IAcademicStructureRepository,
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('ITeacherRolePort')
    private readonly teacherRole: ITeacherRolePort,
  ) {}

  async execute(sectionId: string, dto: CreateSectionCourseDto): Promise<SubjectEntity> {
    const section = await this.repo.findSection(sectionId);
    if (!section) throw new NotFoundException(`Paralelo '${sectionId}' no encontrado`);
    if (!section.isActive) throw new ConflictException('El paralelo está inactivo');

    const catalog = await this.catalogRepo.findById(dto.subjectCatalogId);
    if (!catalog || !catalog.isActive) {
      throw new NotFoundException(`Asignatura '${dto.subjectCatalogId}' no encontrada o inactiva`);
    }

    const offered = await this.repo.listOfferedCatalogIds(sectionId);
    if (offered.includes(catalog.id)) {
      throw new ConflictException(`La asignatura '${catalog.name}' ya está ofertada en este paralelo`);
    }

    if (dto.teacherId && !(await this.teacherRole.isTeacher(dto.teacherId))) {
      throw new BadRequestException('El docente asignado no tiene rol TEACHER');
    }

    const curriculum = await this.repo.getCurriculum(section.gradeLevelCode);
    const hours =
      dto.weeklyHours ??
      curriculum.find((c) => c.subjectCatalogId === catalog.id)?.weeklyHours ??
      null;

    const anchorPeriodId = await resolveAnchorPeriodId(this.yearRepo, this.periodRepo, section.schoolYearId);
    return buildOffering({
      section,
      catalog,
      anchorPeriodId,
      teacherId: dto.teacherId ?? null,
      weeklyHours: hours,
      subjectRepo: this.subjectRepo,
      subjectTeacherRepo: this.subjectTeacherRepo,
    });
  }
}

@Injectable()
export class AssignCourseTeacherUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('ITeacherRolePort')
    private readonly teacherRole: ITeacherRolePort,
  ) {}

  async execute(subjectId: string, dto: AssignCourseTeacherDto): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException(`Curso '${subjectId}' no encontrado`);

    const teacherId = dto.teacherId ?? null;
    if (teacherId) {
      if (!(await this.teacherRole.isTeacher(teacherId))) {
        throw new BadRequestException('El usuario asignado no tiene rol TEACHER');
      }
      const existing = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
        subjectId,
        teacherId,
        subject.academicPeriodId,
      );
      if (!existing) {
        await this.subjectTeacherRepo.save(
          new SubjectTeacherEntity(subjectId, teacherId, subject.academicPeriodId),
        );
      }
    }

    subject.teacherId = teacherId;
    subject.updatedAt = new Date();
    return this.subjectRepo.update(subject);
  }
}

@Injectable()
export class UpdateSubjectCatalogUseCase {
  constructor(
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
  ) {}

  async execute(id: string, dto: UpdateSubjectCatalogDto): Promise<SubjectCatalogEntity> {
    const catalog = await this.catalogRepo.findById(id);
    if (!catalog) throw new NotFoundException(`Asignatura '${id}' no encontrada`);

    if (dto.name !== undefined) catalog.name = dto.name.trim();
    if (dto.description !== undefined) catalog.description = dto.description;
    if (dto.area !== undefined) catalog.area = dto.area?.trim() || null;
    if (dto.isActive !== undefined) catalog.isActive = dto.isActive;
    catalog.updatedAt = new Date();

    return this.catalogRepo.update(catalog);
  }
}
