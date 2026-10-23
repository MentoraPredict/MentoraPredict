import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import {
  Consent,
  GuardianLink,
  StudentEnrollment,
  StudentProfile,
} from '../../domain/entities/people.entity';
import {
  checkEnrollment,
  pickPrimaryAfterLink,
  validateConsentPurpose,
  validateGuardianLink,
  validateStudentProfile,
} from '../../domain/services/people-enrollment';
import { todayInEcuador } from '../dtos/school-year.view';
import {
  EndStudentEnrollmentDto,
  EnrollStudentsDto,
  GrantConsentDto,
  LinkGuardianDto,
  UpsertStudentProfileDto,
} from '../dtos/people-enrollment.dto';
import { IAcademicStructureRepository } from '../ports/output/i-academic-structure.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IPeopleRepository } from '../ports/output/i-people.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';
import {
  IStudentEnrollmentRepository,
  SectionCourse,
} from '../ports/output/i-student-enrollment.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { IUserRolePort } from '../ports/output/i-user-role.port';

export interface Caller {
  id: string;
  role: string;
}

const STAFF_ROLES = ['ADMIN', 'SECRETARY'];
const CURRENT_NOTICE_VERSION = 'v1';

function failIfAny(errors: string[]): void {
  if (errors.length > 0) throw new BadRequestException(errors);
}

const nullIfBlank = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Personal de matrícula, o un representante vinculado al estudiante.
 * Los demás roles no acceden a datos personales ni a consentimientos.
 */
async function assertCanAccessStudent(
  caller: Caller,
  studentId: string,
  people: IPeopleRepository,
): Promise<void> {
  if (STAFF_ROLES.includes(caller.role)) return;
  if (caller.role === 'GUARDIAN' && (await people.findGuardianLink(caller.id, studentId))) return;
  throw new ForbiddenException('No tienes acceso a los datos de este estudiante');
}

async function assertRole(
  roles: IUserRolePort,
  userId: string,
  expected: string,
  label: string,
): Promise<void> {
  const role = await roles.getRole(userId);
  if (role === null) throw new NotFoundException(`${label} '${userId}' no encontrado`);
  if (role !== expected) throw new BadRequestException(`El usuario indicado no es ${label.toLowerCase()}`);
}

/**
 * Crea (o reactiva) las matrículas por asignatura del estudiante. Es lo que
 * mantiene vivo el resto del sistema (notas, evaluaciones, analítica), que
 * sigue colgando de `enrollments`.
 */
export async function enrollStudentInCourses(
  studentId: string,
  courses: SectionCourse[],
  enrollmentRepo: IEnrollmentRepository,
): Promise<number> {
  let changed = 0;
  for (const course of courses) {
    const existing = await enrollmentRepo.findByStudentAndSubject(studentId, course.id);
    if (existing) {
      if (existing.status !== 'ACTIVE') {
        existing.status = 'ACTIVE';
        await enrollmentRepo.update(existing);
        changed++;
      }
      continue;
    }
    const now = new Date();
    await enrollmentRepo.save(
      new EnrollmentEntity(randomUUID(), studentId, course.id, course.academicPeriodId, 'ACTIVE', now, now),
    );
    changed++;
  }
  return changed;
}

@Injectable()
export class GetStudentProfileUseCase {
  constructor(@Inject('IPeopleRepository') private readonly people: IPeopleRepository) {}

  async execute(studentId: string, caller: Caller): Promise<StudentProfile> {
    await assertCanAccessStudent(caller, studentId, this.people);
    return (
      (await this.people.getStudentProfile(studentId)) ?? {
        studentId,
        birthDate: null,
        sex: null,
        nationality: null,
        address: null,
        hasSpecialNeeds: false,
        specialNeedsNotes: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        previousSchool: null,
      }
    );
  }
}

@Injectable()
export class UpsertStudentProfileUseCase {
  constructor(
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserRolePort') private readonly roles: IUserRolePort,
  ) {}

  async execute(studentId: string, dto: UpsertStudentProfileDto): Promise<StudentProfile> {
    await assertRole(this.roles, studentId, 'STUDENT', 'Estudiante');

    const current = await this.people.getStudentProfile(studentId);
    const next: StudentProfile = {
      studentId,
      birthDate: dto.birthDate === undefined ? current?.birthDate ?? null : dto.birthDate,
      sex: dto.sex === undefined ? current?.sex ?? null : dto.sex,
      nationality: dto.nationality === undefined ? current?.nationality ?? null : nullIfBlank(dto.nationality),
      address: dto.address === undefined ? current?.address ?? null : nullIfBlank(dto.address),
      hasSpecialNeeds: dto.hasSpecialNeeds ?? current?.hasSpecialNeeds ?? false,
      specialNeedsNotes:
        dto.specialNeedsNotes === undefined ? current?.specialNeedsNotes ?? null : nullIfBlank(dto.specialNeedsNotes),
      emergencyContactName:
        dto.emergencyContactName === undefined
          ? current?.emergencyContactName ?? null
          : nullIfBlank(dto.emergencyContactName),
      emergencyContactPhone:
        dto.emergencyContactPhone === undefined
          ? current?.emergencyContactPhone ?? null
          : nullIfBlank(dto.emergencyContactPhone),
      previousSchool:
        dto.previousSchool === undefined ? current?.previousSchool ?? null : nullIfBlank(dto.previousSchool),
    };

    failIfAny(validateStudentProfile(next, todayInEcuador()));
    return this.people.saveStudentProfile(next);
  }
}

export interface GuardianLinkView extends GuardianLink {
  guardianName: string;
  studentName: string;
}

@Injectable()
export class ListStudentGuardiansUseCase {
  constructor(
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  async execute(studentId: string, caller: Caller): Promise<GuardianLinkView[]> {
    await assertCanAccessStudent(caller, studentId, this.people);
    return enrichLinks(await this.people.listGuardiansOfStudent(studentId), this.profiles);
  }
}

@Injectable()
export class ListMyStudentsUseCase {
  constructor(
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IStudentEnrollmentRepository') private readonly enrollments: IStudentEnrollmentRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  async execute(guardianId: string) {
    const links = await enrichLinks(await this.people.listStudentsOfGuardian(guardianId), this.profiles);

    return Promise.all(
      links.map(async (link) => {
        const active = (await this.enrollments.listByStudent(link.studentId)).find((e) => e.status === 'ACTIVE');
        const section = active ? await this.structure.findSection(active.sectionId) : null;
        const grade = section ? await this.structure.findGradeLevel(section.gradeLevelCode) : null;

        return {
          ...link,
          activeEnrollment: active
            ? {
                id: active.id,
                sectionName: section?.name ?? null,
                gradeName: grade?.name ?? null,
                shift: section?.shift ?? null,
              }
            : null,
        };
      }),
    );
  }
}

async function enrichLinks(links: GuardianLink[], profiles: IUserProfilePort): Promise<GuardianLinkView[]> {
  const nameOf = async (id: string) => {
    const p = await profiles.getProfile(id).catch(() => null);
    return p ? `${p.firstName} ${p.lastName}`.trim() || p.email : id;
  };
  return Promise.all(
    links.map(async (l) => ({
      ...l,
      guardianName: await nameOf(l.guardianId),
      studentName: await nameOf(l.studentId),
    })),
  );
}

@Injectable()
export class LinkGuardianUseCase {
  constructor(
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserRolePort') private readonly roles: IUserRolePort,
  ) {}

  async execute(studentId: string, dto: LinkGuardianDto): Promise<GuardianLink> {
    const link: GuardianLink = {
      guardianId: dto.guardianId,
      studentId,
      relation: dto.relation,
      isPrimary: dto.isPrimary ?? false,
      canPickup: dto.canPickup ?? true,
      livesWith: dto.livesWith ?? true,
    };
    failIfAny(validateGuardianLink(link));

    await assertRole(this.roles, studentId, 'STUDENT', 'Estudiante');
    await assertRole(this.roles, dto.guardianId, 'GUARDIAN', 'Representante');

    const existing = await this.people.listGuardiansOfStudent(studentId);
    // El primer representante del estudiante queda como principal.
    if (existing.length === 0) link.isPrimary = true;

    const { demoteGuardianIds } = pickPrimaryAfterLink(existing, link);
    return this.people.saveGuardianLink(link, demoteGuardianIds);
  }
}

@Injectable()
export class UnlinkGuardianUseCase {
  constructor(@Inject('IPeopleRepository') private readonly people: IPeopleRepository) {}

  async execute(studentId: string, guardianId: string): Promise<void> {
    const link = await this.people.findGuardianLink(guardianId, studentId);
    if (!link) throw new NotFoundException('El vínculo no existe');
    await this.people.deleteGuardianLink(guardianId, studentId);
  }
}

@Injectable()
export class ListStudentConsentsUseCase {
  constructor(@Inject('IPeopleRepository') private readonly people: IPeopleRepository) {}

  async execute(studentId: string, caller: Caller): Promise<Consent[]> {
    await assertCanAccessStudent(caller, studentId, this.people);
    return this.people.listConsents(studentId);
  }
}

@Injectable()
export class GrantConsentUseCase {
  constructor(@Inject('IPeopleRepository') private readonly people: IPeopleRepository) {}

  async execute(studentId: string, dto: GrantConsentDto, guardianId: string): Promise<Consent> {
    failIfAny(validateConsentPurpose(dto.purpose));
    if (!(await this.people.findGuardianLink(guardianId, studentId))) {
      throw new ForbiddenException('Solo un representante vinculado puede dar su consentimiento');
    }

    const active = await this.people.findActiveConsent(studentId, dto.purpose);
    if (active) return active;

    return this.people.saveConsent({
      id: randomUUID(),
      studentId,
      guardianId,
      purpose: dto.purpose,
      noticeVersion: dto.noticeVersion ?? CURRENT_NOTICE_VERSION,
      grantedAt: new Date(),
      revokedAt: null,
    });
  }
}

@Injectable()
export class RevokeConsentUseCase {
  constructor(@Inject('IPeopleRepository') private readonly people: IPeopleRepository) {}

  async execute(studentId: string, purpose: string, guardianId: string): Promise<void> {
    failIfAny(validateConsentPurpose(purpose));
    if (!(await this.people.findGuardianLink(guardianId, studentId))) {
      throw new ForbiddenException('Solo un representante vinculado puede retirar su consentimiento');
    }

    const active = await this.people.findActiveConsent(studentId, purpose as Consent['purpose']);
    if (!active) throw new NotFoundException('No hay un consentimiento vigente para esa finalidad');
    await this.people.revokeConsent(active.id, new Date());
  }
}

export interface EnrollmentResult {
  studentId: string;
  ok: boolean;
  enrollmentId?: string;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class EnrollStudentsInSectionUseCase {
  constructor(
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
    @Inject('ISchoolYearRepository') private readonly yearRepo: ISchoolYearRepository,
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserRolePort') private readonly roles: IUserRolePort,
  ) {}

  async execute(sectionId: string, dto: EnrollStudentsDto): Promise<EnrollmentResult[]> {
    const section = await this.structure.findSection(sectionId);
    if (!section) throw new NotFoundException(`Paralelo '${sectionId}' no encontrado`);
    if (!section.isActive) throw new ConflictException('El paralelo está inactivo');

    const year = await this.yearRepo.findById(section.schoolYearId);
    if (!year || year.status === 'FINISHED') {
      throw new ConflictException('El año lectivo del paralelo está finalizado');
    }

    const courses = await this.studentEnrollments.listSectionCourses(sectionId);
    const results: EnrollmentResult[] = [];

    for (const studentId of [...new Set(dto.studentIds)]) {
      results.push(await this.enrollOne(studentId, section, courses, dto.notes));
    }
    return results;
  }

  private async enrollOne(
    studentId: string,
    section: NonNullable<Awaited<ReturnType<IAcademicStructureRepository['findSection']>>>,
    courses: SectionCourse[],
    notes?: string,
  ): Promise<EnrollmentResult> {
    const role = await this.roles.getRole(studentId);
    if (role !== 'STUDENT') {
      return { studentId, ok: false, errors: ['El usuario no existe o no es estudiante'], warnings: [] };
    }

    const [active, guardians, consent, count] = await Promise.all([
      this.studentEnrollments.findActive(studentId, section.schoolYearId),
      this.people.listGuardiansOfStudent(studentId),
      this.people.findActiveConsent(studentId, 'DATA_PROCESSING'),
      this.studentEnrollments.countActiveInSection(section.id),
    ]);

    const check = checkEnrollment({
      activeStudentsInSection: count,
      sectionCapacity: section.capacity,
      hasActiveEnrollmentInYear: active !== null,
      hasPrimaryGuardian: guardians.some((g) => g.isPrimary),
      hasDataProcessingConsent: consent !== null,
    });
    if (check.errors.length > 0) {
      return { studentId, ok: false, errors: check.errors, warnings: check.warnings };
    }

    const saved = await this.studentEnrollments.save({
      id: randomUUID(),
      studentId,
      sectionId: section.id,
      schoolYearId: section.schoolYearId,
      status: 'ACTIVE',
      enrolledAt: new Date(),
      endedAt: null,
      notes: notes?.trim() || null,
    });
    await enrollStudentInCourses(studentId, courses, this.enrollmentRepo);

    return { studentId, ok: true, enrollmentId: saved.id, errors: [], warnings: check.warnings };
  }
}

@Injectable()
export class EndStudentEnrollmentUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
  ) {}

  async execute(enrollmentId: string, dto: EndStudentEnrollmentDto): Promise<StudentEnrollment> {
    const enrollment = await this.studentEnrollments.findById(enrollmentId);
    if (!enrollment) throw new NotFoundException(`Matrícula '${enrollmentId}' no encontrada`);
    if (enrollment.status !== 'ACTIVE') {
      throw new ConflictException('Solo se puede cerrar una matrícula activa');
    }

    const updated = await this.studentEnrollments.update({
      ...enrollment,
      status: dto.status,
      endedAt: new Date(),
      notes: dto.notes?.trim() || enrollment.notes,
    });
    await this.studentEnrollments.withdrawCourseEnrollments(enrollment.studentId, enrollment.sectionId);
    return updated;
  }
}

export interface SectionEnrollmentView extends StudentEnrollment {
  studentName: string;
  studentEmail: string;
}

@Injectable()
export class ListSectionEnrollmentsUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  async execute(sectionId: string): Promise<SectionEnrollmentView[]> {
    const list = await this.studentEnrollments.listBySection(sectionId);
    return Promise.all(
      list.map(async (e) => {
        const p = await this.profiles.getProfile(e.studentId).catch(() => null);
        return {
          ...e,
          studentName: p ? `${p.firstName} ${p.lastName}`.trim() : e.studentId,
          studentEmail: p?.email ?? '',
        };
      }),
    );
  }
}

@Injectable()
export class ListStudentEnrollmentsUseCase {
  constructor(
    @Inject('IStudentEnrollmentRepository') private readonly studentEnrollments: IStudentEnrollmentRepository,
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
  ) {}

  async execute(studentId: string, caller: Caller): Promise<StudentEnrollment[]> {
    await assertCanAccessStudent(caller, studentId, this.people);
    return this.studentEnrollments.listByStudent(studentId);
  }
}
