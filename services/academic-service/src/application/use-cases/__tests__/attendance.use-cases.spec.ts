import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AttendanceCalculator } from '../../services/attendance-calculator';
import {
  RequestJustificationUseCase,
  ResolveJustificationUseCase,
} from '../attendance.use-cases';
import { RegisterSessionAttendanceUseCase } from '../register-session-attendance.use-case';

const rule = { maxUnjustifiedPct: 10, warningPcts: [5], appliesFromLevelOrder: 1, justificationDays: 3 };
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });

describe('RequestJustificationUseCase', () => {
  const build = (opts: { linked?: boolean; present?: boolean; existing?: boolean; sessionDate?: string } = {}) => {
    const attendance: any = {
      findSession: jest.fn().mockResolvedValue({ id: 's1', subjectId: 'sub', sessionDate: opts.sessionDate ?? today }),
      listRecords: jest.fn().mockResolvedValue([
        { sessionId: 's1', subjectId: 'sub', studentId: 'stu', present: opts.present ?? false, sessionDate: today, justification: null },
      ]),
      findJustification: jest.fn().mockResolvedValue(opts.existing ? { id: 'j' } : null),
      saveJustification: jest.fn().mockResolvedValue(undefined),
    };
    const studentEnrollments: any = { listByStudent: jest.fn().mockResolvedValue([{ sectionId: 'sec', status: 'ACTIVE' }]) };
    const people: any = { findGuardianLink: jest.fn().mockResolvedValue(opts.linked === false ? null : { guardianId: 'g' }) };
    const subjectRepo: any = { findById: jest.fn().mockResolvedValue({ name: 'Matemática' }) };
    const profiles: any = { getProfile: jest.fn().mockResolvedValue(null) };
    const calculator: any = { contextForSection: jest.fn().mockResolvedValue({ rule, applies: true }) };
    const notifier: any = { notifyJustificationRequested: jest.fn().mockResolvedValue(undefined) };
    return {
      useCase: new RequestJustificationUseCase(attendance, studentEnrollments, people, subjectRepo, profiles, calculator, notifier),
      attendance,
      notifier,
    };
  };
  const dto = { sessionId: 's1', reason: 'Cita médica' };
  const guardian = { id: 'g', role: 'GUARDIAN' };

  it('crea la solicitud y avisa a inspección', async () => {
    const { useCase, attendance, notifier } = build();
    await useCase.execute('stu', dto, guardian);
    expect(attendance.saveJustification).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING', requestedBy: 'g' }));
    expect(notifier.notifyJustificationRequested).toHaveBeenCalled();
  });

  it('rechaza a quien no es representante del estudiante', async () => {
    const { useCase } = build({ linked: false });
    await expect(useCase.execute('stu', dto, guardian)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('exige que exista una falta', async () => {
    const { useCase } = build({ present: true });
    await expect(useCase.execute('stu', dto, guardian)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no permite justificar dos veces', async () => {
    const { useCase } = build({ existing: true });
    await expect(useCase.execute('stu', dto, guardian)).rejects.toBeInstanceOf(ConflictException);
  });

  it('respeta el plazo configurado', async () => {
    const { useCase, attendance } = build({ sessionDate: '2020-01-01' });
    await expect(useCase.execute('stu', dto, guardian)).rejects.toBeInstanceOf(ConflictException);
    expect(attendance.saveJustification).not.toHaveBeenCalled();
  });
});

describe('ResolveJustificationUseCase', () => {
  const build = (status = 'PENDING') => {
    const attendance: any = {
      findJustificationById: jest.fn().mockResolvedValue({
        id: 'j', sessionId: 's1', studentId: 'stu', requestedBy: 'g', reason: 'x', status,
        resolvedBy: null, resolvedAt: null, resolutionNote: null, createdAt: new Date(), subjectId: 'sub', sessionDate: today,
      }),
      saveJustification: jest.fn().mockResolvedValue(undefined),
    };
    const subjectRepo: any = { findById: jest.fn().mockResolvedValue({ name: 'Matemática' }) };
    const profiles: any = { getProfile: jest.fn().mockResolvedValue(null) };
    const notifier: any = { notifyJustificationResolved: jest.fn().mockResolvedValue(undefined) };
    return { useCase: new ResolveJustificationUseCase(attendance, subjectRepo, profiles, notifier), attendance, notifier };
  };
  const inspector = { id: 'i', role: 'INSPECTOR' };

  it('aprueba y avisa al representante', async () => {
    const { useCase, attendance, notifier } = build();
    await useCase.execute('j', { approve: true }, inspector);
    expect(attendance.saveJustification).toHaveBeenCalledWith(expect.objectContaining({ status: 'APPROVED', resolvedBy: 'i' }));
    expect(notifier.notifyJustificationResolved).toHaveBeenCalledWith(expect.objectContaining({ approved: true, requestedBy: 'g' }));
  });

  it('exige motivo para rechazar', async () => {
    const { useCase } = build();
    await expect(useCase.execute('j', { approve: false }, inspector)).rejects.toBeInstanceOf(BadRequestException);
    await expect(useCase.execute('j', { approve: false, note: 'Sin respaldo' }, inspector)).resolves.toBeUndefined();
  });

  it('solo inspección o administración resuelven', async () => {
    const { useCase } = build();
    await expect(useCase.execute('j', { approve: true }, { id: 't', role: 'TEACHER' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('no resuelve dos veces', async () => {
    const { useCase } = build('APPROVED');
    await expect(useCase.execute('j', { approve: true }, inspector)).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('RegisterSessionAttendanceUseCase en un curso de paralelo', () => {
  const build = (sessionDate: Date, recordsAfter: Array<{ present: boolean }>) => {
    const sessionRepo: any = {
      findById: jest.fn().mockResolvedValue({ id: 's1', subjectId: 'sub', sessionDate, academicWeek: 1, academicYear: 2026 }),
      findBySubjectWeek: jest.fn().mockResolvedValue([]),
    };
    const attendanceRepo: any = { upsertMany: jest.fn().mockResolvedValue(undefined) };
    const checkInRepo: any = { findByStudentSubjectWeek: jest.fn().mockResolvedValue(null) };
    const ownership: any = { execute: jest.fn().mockResolvedValue({ isOwner: true }) };
    const subjectRepo: any = { findById: jest.fn().mockResolvedValue({ id: 'sub', name: 'Matemática', sectionId: 'sec' }) };
    // Primera lectura (antes) sin faltas; segunda (después) con las indicadas.
    const attendanceQuery: any = {
      listRecords: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValue(recordsAfter.map((r, i) => ({ sessionId: `x${i}`, subjectId: 'sub', studentId: 'stu', present: r.present, sessionDate: today, justification: null }))),
    };
    const grading: any = { listActiveStudentIds: jest.fn().mockResolvedValue(['stu']) };
    const structure: any = {
      findSection: jest.fn().mockResolvedValue({ id: 'sec', gradeLevelCode: 'EGB_8' }),
      findGradeLevel: jest.fn().mockResolvedValue({ levelCode: 'EGB_SUPERIOR' }),
    };
    const config: any = {
      getAttendanceRule: jest.fn().mockResolvedValue(rule),
      listLevelCatalog: jest.fn().mockResolvedValue([{ code: 'EGB_SUPERIOR', sortOrder: 5 }]),
    };
    const calculator = new AttendanceCalculator(attendanceQuery, config, structure);
    const notifier: any = { notifyThreshold: jest.fn().mockResolvedValue(undefined) };
    return {
      useCase: new RegisterSessionAttendanceUseCase(
        sessionRepo, attendanceRepo, checkInRepo, ownership, subjectRepo, attendanceQuery, grading, calculator, notifier,
      ),
      attendanceRepo,
      notifier,
    };
  };
  const teacher = { id: 't', role: 'TEACHER' };

  it('avisa cuando un estudiante supera el límite', async () => {
    const { useCase, notifier } = build(new Date(Date.now() - 2 * 24 * 3600 * 1000), [{ present: false }, { present: true }]);
    await useCase.execute('sub', 's1', [{ studentId: 'stu', present: false }], teacher.id, teacher.role);
    expect(notifier.notifyThreshold).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'stu', status: 'EXCEEDED' }));
  });

  it('no registra clases futuras', async () => {
    const future = new Date(Date.now() + 10 * 24 * 3600 * 1000);
    const { useCase, attendanceRepo } = build(future, []);
    await expect(
      useCase.execute('sub', 's1', [{ studentId: 'stu', present: true }], teacher.id, teacher.role),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(attendanceRepo.upsertMany).not.toHaveBeenCalled();
  });

  it('rechaza estudiantes que no son del curso', async () => {
    const { useCase } = build(new Date(Date.now() - 2 * 24 * 3600 * 1000), []);
    await expect(
      useCase.execute('sub', 's1', [{ studentId: 'otro', present: true }], teacher.id, teacher.role),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
