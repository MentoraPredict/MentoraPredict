import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';
import { GradingScale, PromotionRule } from '../../../domain/entities/institution-config.entity';
import { GradingCalculator } from '../../services/grading-calculator';
import {
  ClosePeriodUseCase,
  ConfirmPromotionUseCase,
  SaveGradesUseCase,
} from '../grading.use-cases';

const scale: GradingScale = {
  id: 's',
  name: 'Escala',
  minValue: 0,
  maxValue: 10,
  passingGrade: 7,
  decimals: 2,
  bands: [
    { code: 'NAAR', label: 'No alcanza', minValue: 0, maxValue: 4 },
    { code: 'PAAR', label: 'Próximo', minValue: 4.01, maxValue: 6.99 },
    { code: 'AAR', label: 'Alcanza', minValue: 7, maxValue: 8.99 },
    { code: 'DAR', label: 'Domina', minValue: 9, maxValue: 10 },
  ],
};

const components = [
  { code: 'FORMATIVE', name: 'Formativa', weight: 70, sortOrder: 1 },
  { code: 'SUMMATIVE', name: 'Sumativa', weight: 30, sortOrder: 2 },
];

const rule: PromotionRule = {
  levelCode: 'EGB_SUPERIOR',
  minAverage: 7,
  allowsSupplementary: false,
  supplementaryMinAverage: 4,
  repetitionPolicy: 'BY_GRADE',
};

const period = (over: Partial<{ closedAt: Date | null; gradesDueDate: string | null; schoolYearId: string }> = {}) =>
  new AcademicPeriodEntity(
    'p1',
    'Primer trimestre',
    'T1',
    '',
    new Date('2026-09-01'),
    new Date('2026-11-30'),
    'ACTIVE',
    'TRIMESTER',
    new Date(),
    new Date(),
    over.schoolYearId ?? 'year-1',
    1,
    over.gradesDueDate === undefined ? null : over.gradesDueDate,
    over.closedAt ?? null,
    null,
  );

const subject = { id: 'sub-1', name: 'Matemática', code: 'MAT', sectionId: 'sec-1', teacherId: 'teacher-1', academicPeriodId: 'p1' };
const section = { id: 'sec-1', schoolYearId: 'year-1', gradeLevelCode: 'EGB_8', name: 'A' };

describe('SaveGradesUseCase', () => {
  const activity = (id: string) => ({ id, subjectId: 'sub-1', periodId: 'p1', componentCode: 'FORMATIVE', name: id, dueDate: null, isActive: true });

  const build = (opts: { period?: AcademicPeriodEntity; teacherOwns?: boolean } = {}) => {
    const subjectRepo: any = { findById: jest.fn().mockResolvedValue(subject) };
    const teachers: any = { findBySubjectTeacherAndPeriod: jest.fn().mockResolvedValue(opts.teacherOwns ? {} : null) };
    const periodRepo: any = { findById: jest.fn().mockResolvedValue(opts.period ?? period()) };
    const structure: any = { findSection: jest.fn().mockResolvedValue(section) };
    const grading: any = {
      listActivities: jest.fn().mockResolvedValue([activity('a1'), { ...activity('a2'), isActive: false }]),
      listActiveStudentIds: jest.fn().mockResolvedValue(['stu-1', 'stu-2']),
      upsertGrades: jest.fn().mockResolvedValue({ created: 1, updated: 0, unchanged: 0 }),
    };
    const config: any = { getGradingScale: jest.fn().mockResolvedValue(scale) };
    const profiles: any = { getProfile: jest.fn().mockResolvedValue(null) };
    const analytics: any = { triggerRecalculate: jest.fn().mockResolvedValue(undefined) };
    return {
      useCase: new SaveGradesUseCase(subjectRepo, teachers, periodRepo, structure, grading, config, profiles, analytics),
      grading,
      analytics,
    };
  };

  const dto = (entries: Array<{ studentId: string; activityId: string; value: number }>) => ({ periodId: 'p1', entries });

  it('guarda las notas del docente dueño del curso y recalcula la analítica', async () => {
    const { useCase, grading, analytics } = build();

    const result = await useCase.execute('sub-1', dto([{ studentId: 'stu-1', activityId: 'a1', value: 8.5 }]), {
      id: 'teacher-1',
      role: 'TEACHER',
    });

    expect(result.created).toBe(1);
    expect(grading.upsertGrades).toHaveBeenCalledWith(
      [{ studentId: 'stu-1', activityId: 'a1', value: 8.5, subjectId: 'sub-1' }],
      'teacher-1',
    );
    expect(analytics.triggerRecalculate).toHaveBeenCalledWith('sub-1', 'p1', ['stu-1']);
  });

  it('rechaza a un docente que no dicta el curso', async () => {
    const { useCase, grading } = build();

    await expect(
      useCase.execute('sub-1', dto([{ studentId: 'stu-1', activityId: 'a1', value: 8 }]), { id: 'otro', role: 'TEACHER' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(grading.upsertGrades).not.toHaveBeenCalled();
  });

  it('rechaza guardar en un periodo cerrado', async () => {
    const { useCase } = build({ period: period({ closedAt: new Date() }) });

    await expect(
      useCase.execute('sub-1', dto([{ studentId: 'stu-1', activityId: 'a1', value: 8 }]), { id: 'teacher-1', role: 'TEACHER' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('bloquea al docente tras la fecha límite pero no al administrador', async () => {
    const { useCase } = build({ period: period({ gradesDueDate: '2020-01-01' }) });
    const body = dto([{ studentId: 'stu-1', activityId: 'a1', value: 8 }]);

    await expect(useCase.execute('sub-1', body, { id: 'teacher-1', role: 'TEACHER' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(useCase.execute('sub-1', body, { id: 'admin-1', role: 'ADMIN' })).resolves.toBeDefined();
  });

  it('no guarda nada si alguna fila es inválida', async () => {
    const { useCase, grading } = build();

    await expect(
      useCase.execute(
        'sub-1',
        dto([
          { studentId: 'stu-1', activityId: 'a1', value: 8 },
          { studentId: 'stu-2', activityId: 'a1', value: 11 },
          { studentId: 'intruso', activityId: 'a1', value: 7 },
          { studentId: 'stu-1', activityId: 'a2', value: 7 },
        ]),
        { id: 'teacher-1', role: 'TEACHER' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(grading.upsertGrades).not.toHaveBeenCalled();
  });
});

/** Repositorios en memoria para el cierre y la promoción. */
function buildCalculator(opts: {
  studentIds: string[];
  rows: Array<{ studentId: string; activityId: string; componentCode: string; value: number }>;
  rules?: PromotionRule[];
  periods?: AcademicPeriodEntity[];
  snapshots?: any[];
}) {
  const grading: any = {
    getComponents: jest.fn().mockResolvedValue(components),
    listActiveStudentIds: jest.fn().mockResolvedValue(opts.studentIds),
    listGradeRows: jest.fn().mockImplementation(({ studentId }: { studentId?: string }) =>
      Promise.resolve(
        opts.rows
          .filter((r) => !studentId || r.studentId === studentId)
          .map((r) => ({ ...r, gradeId: 'g', subjectId: 'sub-1', periodId: 'p1' })),
      ),
    ),
    listSchoolYearCourses: jest.fn().mockResolvedValue([{ ...subject, sectionId: 'sec-1' }]),
    listSectionCourses: jest.fn().mockResolvedValue([subject]),
    listPeriodResults: jest.fn().mockResolvedValue(opts.snapshots ?? []),
    listSupplementary: jest.fn().mockResolvedValue([]),
    closePeriod: jest.fn().mockResolvedValue(undefined),
    saveDecision: jest.fn().mockResolvedValue(undefined),
    getDecision: jest.fn().mockResolvedValue(null),
    listDecisions: jest.fn().mockResolvedValue([]),
  };
  const config: any = {
    getGradingScale: jest.fn().mockResolvedValue(scale),
    getPromotionRules: jest.fn().mockResolvedValue(opts.rules ?? [rule]),
  };
  const periodRepo: any = {
    findById: jest.fn().mockResolvedValue(opts.periods?.[0] ?? period()),
    findBySchoolYear: jest.fn().mockResolvedValue(opts.periods ?? [period()]),
  };
  const structure: any = {
    findSection: jest.fn().mockResolvedValue(section),
    findGradeLevel: jest.fn().mockResolvedValue({ code: 'EGB_8', levelCode: 'EGB_SUPERIOR' }),
    listSections: jest.fn().mockResolvedValue([section]),
    listGradeLevels: jest.fn().mockResolvedValue([{ code: 'EGB_8', name: '8.º EGB' }]),
  };
  const calculator = new GradingCalculator(grading, config, periodRepo, structure);
  return { calculator, grading, periodRepo, structure };
}

describe('ClosePeriodUseCase', () => {
  const complete = (studentId: string) => [
    { studentId, activityId: 'a1', componentCode: 'FORMATIVE', value: 9 },
    { studentId, activityId: 'a2', componentCode: 'SUMMATIVE', value: 7 },
  ];

  it('bloquea el cierre si hay estudiantes sin nota completa', async () => {
    const { calculator, grading, periodRepo, structure } = buildCalculator({
      studentIds: ['stu-1', 'stu-2'],
      rows: complete('stu-1'),
    });
    const profiles: any = { getProfile: jest.fn().mockResolvedValue(null) };
    const useCase = new ClosePeriodUseCase(periodRepo, structure, grading, profiles, calculator);

    await expect(useCase.execute('p1', {}, { id: 'admin-1', role: 'ADMIN' })).rejects.toBeInstanceOf(ConflictException);
    expect(grading.closePeriod).not.toHaveBeenCalled();
  });

  it('cierra y guarda la foto con la nota ponderada', async () => {
    const { calculator, grading, periodRepo, structure } = buildCalculator({
      studentIds: ['stu-1'],
      rows: complete('stu-1'),
    });
    const profiles: any = { getProfile: jest.fn().mockResolvedValue(null) };
    const useCase = new ClosePeriodUseCase(periodRepo, structure, grading, profiles, calculator);

    const totals = await useCase.execute('p1', {}, { id: 'admin-1', role: 'ADMIN' });

    expect(totals).toEqual({ courses: 1, students: 1, incomplete: 0 });
    const [, , results, event] = grading.closePeriod.mock.calls[0];
    // 9 * 0.7 + 7 * 0.3 = 8.4
    expect(results).toEqual([expect.objectContaining({ studentId: 'stu-1', value: 8.4, isComplete: true, bandCode: 'AAR' })]);
    expect(event.action).toBe('CLOSE');
  });

  it('permite cerrar con notas incompletas si se acepta y deja el valor vacío', async () => {
    const { calculator, grading, periodRepo, structure } = buildCalculator({
      studentIds: ['stu-1', 'stu-2'],
      rows: complete('stu-1'),
    });
    const profiles: any = { getProfile: jest.fn().mockResolvedValue(null) };
    const useCase = new ClosePeriodUseCase(periodRepo, structure, grading, profiles, calculator);

    const totals = await useCase.execute('p1', { allowIncomplete: true }, { id: 'admin-1', role: 'ADMIN' });

    expect(totals.incomplete).toBe(1);
    const [, , results] = grading.closePeriod.mock.calls[0];
    expect(results.find((r: any) => r.studentId === 'stu-2')).toMatchObject({ value: null, isComplete: false });
  });

  it('no cierra dos veces el mismo periodo', async () => {
    const closed = period({ closedAt: new Date() });
    const { calculator, grading, periodRepo, structure } = buildCalculator({
      studentIds: [],
      rows: [],
      periods: [closed],
    });
    const useCase = new ClosePeriodUseCase(periodRepo, structure, grading, { getProfile: jest.fn().mockResolvedValue(null) } as any, calculator);

    await expect(useCase.execute('p1', {}, { id: 'admin-1', role: 'ADMIN' })).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('ConfirmPromotionUseCase', () => {
  const closedPeriod = () => period({ closedAt: new Date() });
  const snapshot = (value: number) => ({ periodId: 'p1', subjectId: 'sub-1', studentId: 'stu-1', value, isComplete: true, bandCode: null });
  const enrollment = { id: 'enr-1', studentId: 'stu-1', sectionId: 'sec-1', schoolYearId: 'year-1', status: 'ACTIVE' };

  const build = (snapshots: any[], periods = [closedPeriod()]) => {
    const { calculator, grading } = buildCalculator({ studentIds: ['stu-1'], rows: [], snapshots, periods });
    const studentEnrollments: any = { findById: jest.fn().mockResolvedValue(enrollment) };
    const useCase = new ConfirmPromotionUseCase(studentEnrollments, grading, { getProfile: jest.fn().mockResolvedValue(null) } as any, calculator);
    return { useCase, grading };
  };

  it('confirma la promoción sugerida sin exigir motivo', async () => {
    const { useCase, grading } = build([snapshot(8)]);

    const [result] = await useCase.execute(
      'sec-1',
      { decisions: [{ studentEnrollmentId: 'enr-1', outcome: 'PROMOTED' }] },
      { id: 'admin-1', role: 'ADMIN' },
    );

    expect(result.ok).toBe(true);
    expect(grading.saveDecision).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'PROMOTED', suggested: 'PROMOTED', isOverride: false }),
    );
  });

  it('exige un motivo para contradecir la sugerencia', async () => {
    const { useCase, grading } = build([snapshot(5)]); // sugiere REPEATS

    const [result] = await useCase.execute(
      'sec-1',
      { decisions: [{ studentEnrollmentId: 'enr-1', outcome: 'PROMOTED' }] },
      { id: 'admin-1', role: 'ADMIN' },
    );

    expect(result.ok).toBe(false);
    expect(grading.saveDecision).not.toHaveBeenCalled();

    const [withReason] = await useCase.execute(
      'sec-1',
      { decisions: [{ studentEnrollmentId: 'enr-1', outcome: 'PROMOTED', notes: 'Resolución de la junta' }] },
      { id: 'admin-1', role: 'ADMIN' },
    );
    expect(withReason.ok).toBe(true);
    expect(grading.saveDecision).toHaveBeenCalledWith(expect.objectContaining({ isOverride: true }));
  });

  it('no permite decidir mientras haya periodos abiertos', async () => {
    const { useCase, grading } = build([], [period()]);

    const [result] = await useCase.execute(
      'sec-1',
      { decisions: [{ studentEnrollmentId: 'enr-1', outcome: 'PROMOTED' }] },
      { id: 'admin-1', role: 'ADMIN' },
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('Aún no se puede decidir');
    expect(grading.saveDecision).not.toHaveBeenCalled();
  });
});
