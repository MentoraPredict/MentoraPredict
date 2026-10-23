import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import {
  EndStudentEnrollmentUseCase,
  EnrollStudentsInSectionUseCase,
  GetStudentProfileUseCase,
  GrantConsentUseCase,
  LinkGuardianUseCase,
} from '../people-enrollment.use-cases';

const section = {
  id: 'sec-1',
  schoolYearId: 'year-1',
  gradeLevelCode: 'EGB_8',
  name: 'A',
  shift: 'MATUTINA',
  capacity: 2,
  tutorId: null,
  isActive: true,
};

describe('EnrollStudentsInSectionUseCase', () => {
  const build = (opts: { role?: string | null; active?: unknown; count?: number; guardians?: unknown[]; consent?: unknown } = {}) => {
    const structure: any = { findSection: jest.fn().mockResolvedValue(section) };
    const yearRepo: any = { findById: jest.fn().mockResolvedValue({ id: 'year-1', status: 'ACTIVE' }) };
    const studentEnrollments: any = {
      listSectionCourses: jest.fn().mockResolvedValue([
        { id: 'c1', academicPeriodId: 'p1' },
        { id: 'c2', academicPeriodId: 'p1' },
      ]),
      findActive: jest.fn().mockResolvedValue(opts.active ?? null),
      countActiveInSection: jest.fn().mockResolvedValue(opts.count ?? 0),
      save: jest.fn((e) => Promise.resolve(e)),
    };
    const enrollmentRepo: any = {
      findByStudentAndSubject: jest.fn().mockResolvedValue(null),
      save: jest.fn((e) => Promise.resolve(e)),
      update: jest.fn(),
    };
    const people: any = {
      listGuardiansOfStudent: jest.fn().mockResolvedValue(opts.guardians ?? [{ isPrimary: true }]),
      findActiveConsent: jest.fn().mockResolvedValue(opts.consent === undefined ? { id: 'c' } : opts.consent),
    };
    const roles: any = {
      getRole: jest.fn().mockResolvedValue(opts.role === undefined ? 'STUDENT' : opts.role),
    };
    return {
      useCase: new EnrollStudentsInSectionUseCase(structure, yearRepo, studentEnrollments, enrollmentRepo, people, roles),
      studentEnrollments,
      enrollmentRepo,
    };
  };

  it('matricula al estudiante y lo inscribe en todos los cursos del paralelo', async () => {
    const { useCase, studentEnrollments, enrollmentRepo } = build();

    const [result] = await useCase.execute('sec-1', { studentIds: ['stu-1'] });

    expect(result).toMatchObject({ ok: true, errors: [], warnings: [] });
    expect(studentEnrollments.save).toHaveBeenCalledTimes(1);
    expect(enrollmentRepo.save).toHaveBeenCalledTimes(2);
  });

  it('rechaza usuarios que no son estudiantes', async () => {
    const { useCase, studentEnrollments } = build({ role: 'TEACHER' });

    const [result] = await useCase.execute('sec-1', { studentIds: ['x'] });

    expect(result.ok).toBe(false);
    expect(studentEnrollments.save).not.toHaveBeenCalled();
  });

  it('rechaza una segunda matrícula activa en el mismo año', async () => {
    const { useCase } = build({ active: { id: 'e1' } });

    const [result] = await useCase.execute('sec-1', { studentIds: ['stu-1'] });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain('El estudiante ya tiene una matrícula activa en este año lectivo');
  });

  it('rechaza cuando el paralelo no tiene cupo', async () => {
    const { useCase } = build({ count: 2 });
    const [result] = await useCase.execute('sec-1', { studentIds: ['stu-1'] });
    expect(result.errors).toContain('El paralelo no tiene cupo disponible');
  });

  it('matricula con avisos si falta representante o consentimiento', async () => {
    const { useCase } = build({ guardians: [], consent: null });

    const [result] = await useCase.execute('sec-1', { studentIds: ['stu-1'] });

    expect(result.ok).toBe(true);
    expect(result.warnings).toHaveLength(2);
  });

  it('respeta el cupo dentro de un mismo lote', async () => {
    const { useCase, studentEnrollments } = build({ count: 1 });
    // el primero ocupa el último cupo: el conteo sube a 2 para el segundo
    studentEnrollments.countActiveInSection
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const results = await useCase.execute('sec-1', { studentIds: ['a', 'b'] });

    expect(results.map((r) => r.ok)).toEqual([true, false]);
  });
});

describe('EndStudentEnrollmentUseCase', () => {
  it('cierra la matrícula y retira al estudiante de los cursos del paralelo', async () => {
    const repo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'e1', studentId: 's1', sectionId: 'sec-1', status: 'ACTIVE', notes: null }),
      update: jest.fn((e) => Promise.resolve(e)),
      withdrawCourseEnrollments: jest.fn(),
    };

    const result = await new EndStudentEnrollmentUseCase(repo).execute('e1', { status: 'WITHDRAWN' });

    expect(result.status).toBe('WITHDRAWN');
    expect(repo.withdrawCourseEnrollments).toHaveBeenCalledWith('s1', 'sec-1');
  });

  it('no permite cerrar una matrícula que ya no está activa', async () => {
    const repo: any = {
      findById: jest.fn().mockResolvedValue({ id: 'e1', status: 'WITHDRAWN' }),
    };
    await expect(new EndStudentEnrollmentUseCase(repo).execute('e1', { status: 'WITHDRAWN' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe('acceso y vínculos', () => {
  const people = (link: unknown = null): any => ({
    findGuardianLink: jest.fn().mockResolvedValue(link),
    listGuardiansOfStudent: jest.fn().mockResolvedValue([]),
    saveGuardianLink: jest.fn((l) => Promise.resolve(l)),
    getStudentProfile: jest.fn().mockResolvedValue(null),
    findActiveConsent: jest.fn().mockResolvedValue(null),
    saveConsent: jest.fn((c) => Promise.resolve(c)),
  });

  it('un representante solo ve a sus propios representados', async () => {
    const useCase = new GetStudentProfileUseCase(people(null));
    await expect(useCase.execute('stu-1', { id: 'g1', role: 'GUARDIAN' })).rejects.toBeInstanceOf(ForbiddenException);

    const linked = new GetStudentProfileUseCase(people({ guardianId: 'g1' }));
    await expect(linked.execute('stu-1', { id: 'g1', role: 'GUARDIAN' })).resolves.toMatchObject({ studentId: 'stu-1' });
  });

  it('un docente no accede a la ficha del estudiante', async () => {
    const useCase = new GetStudentProfileUseCase(people());
    await expect(useCase.execute('stu-1', { id: 't1', role: 'TEACHER' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('el primer representante vinculado queda como principal', async () => {
    const repo = people();
    const roles: any = { getRole: jest.fn((id: string) => Promise.resolve(id === 'stu-1' ? 'STUDENT' : 'GUARDIAN')) };

    const link = await new LinkGuardianUseCase(repo, roles).execute('stu-1', { guardianId: 'g1', relation: 'MOTHER' });

    expect(link.isPrimary).toBe(true);
  });

  it('no vincula a quien no tiene rol de representante', async () => {
    const roles: any = { getRole: jest.fn((id: string) => Promise.resolve(id === 'stu-1' ? 'STUDENT' : 'TEACHER')) };
    await expect(
      new LinkGuardianUseCase(people(), roles).execute('stu-1', { guardianId: 't1', relation: 'OTHER' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('solo un representante vinculado puede otorgar consentimiento, y es idempotente', async () => {
    await expect(
      new GrantConsentUseCase(people(null)).execute('stu-1', { purpose: 'AI_ANALYSIS' }, 'g1'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const repo = people({ guardianId: 'g1' });
    const granted = await new GrantConsentUseCase(repo).execute('stu-1', { purpose: 'AI_ANALYSIS' }, 'g1');
    expect(granted).toMatchObject({ purpose: 'AI_ANALYSIS', noticeVersion: 'v1', revokedAt: null });

    repo.findActiveConsent.mockResolvedValue(granted);
    await new GrantConsentUseCase(repo).execute('stu-1', { purpose: 'AI_ANALYSIS' }, 'g1');
    expect(repo.saveConsent).toHaveBeenCalledTimes(1);
  });
});
