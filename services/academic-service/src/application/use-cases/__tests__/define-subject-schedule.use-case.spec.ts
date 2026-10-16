import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DefineSubjectScheduleUseCase } from '../define-subject-schedule.use-case';
import { CheckSubjectOwnershipUseCase } from '../check-subject-ownership.use-case';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { IClassScheduleRepository } from '../../ports/output/i-class-schedule.repository';
import { IClassSessionRepository } from '../../ports/output/i-class-session.repository';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';
import { ClassScheduleEntity } from '../../../domain/entities/class-schedule.entity';

const mockSubjectRepo = (): jest.Mocked<ISubjectRepository> => ({
  findById: jest.fn(),
  findByAcademicPeriodId: jest.fn(),
  findAll: jest.fn(),
  findByCatalogAndPeriod: jest.fn(),
  hasAcademicRecords: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockPeriodRepo = (): jest.Mocked<IAcademicPeriodRepository> => ({
  findById: jest.fn(),
  findActive: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  findBySchoolYear: jest.fn(),
  countActive: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasRecords: jest.fn(),
  delete: jest.fn(),
});

const mockScheduleRepo = (): jest.Mocked<IClassScheduleRepository> => ({
  findById: jest.fn(),
  findBySubjectId: jest.fn(),
  saveMany: jest.fn(),
  deleteBySubjectId: jest.fn(),
});

const mockSessionRepo = (): jest.Mocked<IClassSessionRepository> => ({
  findById: jest.fn(),
  findBySubjectId: jest.fn(),
  findBySubjectWeek: jest.fn(),
  saveMany: jest.fn().mockResolvedValue(undefined),
});

const mockCheckOwnershipUC = (): jest.Mocked<Pick<CheckSubjectOwnershipUseCase, 'execute'>> => ({
  execute: jest.fn().mockResolvedValue({ isOwner: true }),
});

const makeSubject = () =>
  new SubjectEntity(
    'subj-1', 'Prog Web', '', 'PW-701', 4, 'career-1', 'period-1', 30, 'teacher-1', true,
    new Date(), new Date(), null, 'catalog-1',
  );

const makePeriod = () =>
  new AcademicPeriodEntity(
    'period-1', '2026-A', '2026-1', '',
    new Date('2026-02-02'), new Date('2026-02-23'), // exactamente 4 lunes/miércoles
    'ACTIVE', 'SEMESTER', new Date(), new Date(),
  );

describe('DefineSubjectScheduleUseCase', () => {
  let useCase: DefineSubjectScheduleUseCase;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;
  let scheduleRepo: jest.Mocked<IClassScheduleRepository>;
  let sessionRepo: jest.Mocked<IClassSessionRepository>;
  let checkOwnershipUC: jest.Mocked<Pick<CheckSubjectOwnershipUseCase, 'execute'>>;

  beforeEach(() => {
    subjectRepo = mockSubjectRepo();
    periodRepo = mockPeriodRepo();
    scheduleRepo = mockScheduleRepo();
    sessionRepo = mockSessionRepo();
    checkOwnershipUC = mockCheckOwnershipUC();
    useCase = new DefineSubjectScheduleUseCase(
      subjectRepo,
      periodRepo,
      scheduleRepo,
      sessionRepo,
      checkOwnershipUC as unknown as CheckSubjectOwnershipUseCase,
    );
  });

  it('creates one class_session per matching weekday within the period range, per slot', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    scheduleRepo.findBySubjectId.mockResolvedValue([]);
    periodRepo.findById.mockResolvedValue(makePeriod());
    scheduleRepo.saveMany.mockImplementation(async (schedules) => schedules);

    const slots = [
      { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00' },
      { dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '10:00' },
    ];

    await useCase.execute('subj-1', slots, 'teacher-1', 'TEACHER');

    expect(scheduleRepo.saveMany).toHaveBeenCalledTimes(1);
    expect(sessionRepo.saveMany).toHaveBeenCalledTimes(1);
    // 2026-02-02 (lunes) al 2026-02-23 (lunes), inclusive:
    // lunes 2/9/16/23 (4) + miércoles 4/11/18 (3) = 7 sesiones
    const sessions = sessionRepo.saveMany.mock.calls[0][0];
    expect(sessions).toHaveLength(7);
  });

  it('throws ConflictException when the subject already has a schedule', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    scheduleRepo.findBySubjectId.mockResolvedValue([
      new ClassScheduleEntity('sch-1', 'subj-1', 'MONDAY', '08:00', '10:00', new Date(), new Date()),
    ]);

    await expect(
      useCase.execute('subj-1', [{ dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '10:00' }], 'teacher-1', 'TEACHER'),
    ).rejects.toThrow(ConflictException);
    expect(sessionRepo.saveMany).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the subject does not exist', async () => {
    subjectRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', [{ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00' }], 'teacher-1', 'TEACHER'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when a TEACHER does not own the subject', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    checkOwnershipUC.execute.mockResolvedValue({ isOwner: false });

    await expect(
      useCase.execute('subj-1', [{ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00' }], 'other-teacher', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
    expect(sessionRepo.saveMany).not.toHaveBeenCalled();
  });

  it('skips the ownership check for ADMIN callers', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    scheduleRepo.findBySubjectId.mockResolvedValue([]);
    periodRepo.findById.mockResolvedValue(makePeriod());
    scheduleRepo.saveMany.mockImplementation(async (schedules) => schedules);

    await useCase.execute('subj-1', [{ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00' }], 'admin-1', 'ADMIN');

    expect(checkOwnershipUC.execute).not.toHaveBeenCalled();
  });
});
