import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSubjectUseCase } from '../create-subject.use-case';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { ICareerRepository } from '../../ports/output/i-career.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../../ports/output/i-subject-teacher.repository';
import { INotificationClientPort } from '../../ports/output/i-notification-client.port';
import { IUserProfilePort } from '../../ports/output/i-user-profile.port';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { CareerEntity } from '../../../domain/entities/career.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

const mockSubjectRepo = (): jest.Mocked<ISubjectRepository> => ({
  findById: jest.fn(),
  findByAcademicPeriodId: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByNameAndPeriod: jest.fn(),
  hasAcademicRecords: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockCareerRepo = (): jest.Mocked<ICareerRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFaculty: jest.fn(),
  findByCode: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasSubjects: jest.fn(),
  delete: jest.fn(),
});

const mockPeriodRepo = (): jest.Mocked<IAcademicPeriodRepository> => ({
  findById: jest.fn(),
  findActive: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  countActive: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasRecords: jest.fn(),
  delete: jest.fn(),
});

const mockSubjectTeacherRepo = (): jest.Mocked<ISubjectTeacherRepository> => ({
  findBySubjectTeacherAndPeriod: jest.fn(),
  save: jest.fn(),
  findByTeacherIdWithDetails: jest.fn(),
});

const mockNotificationClient = (): jest.Mocked<INotificationClientPort> => ({
  notify: jest.fn().mockResolvedValue(undefined),
});

const mockUserProfilePort = (): jest.Mocked<IUserProfilePort> => ({
  getProfile: jest.fn().mockResolvedValue(null),
});

const makeCareer = () =>
  new CareerEntity('career-1', 'Ing. Sistemas', 'IS', '', 'ACTIVE', 'faculty-1', 10, new Date(), new Date());

const makePeriod = (status: 'PLANNED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED' = 'ACTIVE') =>
  new AcademicPeriodEntity(
    'period-1', '2025-I', '2025-1', '',
    new Date('2025-02-01'), new Date('2025-06-30'),
    status, 'SEMESTER', new Date(), new Date(),
  );

const makeExistingSubject = () =>
  new SubjectEntity('subj-x', 'Prog Web', '', 'PW-701', 4, 'career-1', 'period-1', 30, null, true, new Date(), new Date());

const validDto = {
  name: 'Prog Web',
  code: 'PW-701',
  credits: 4,
  careerId: 'career-1',
  academicPeriodId: 'period-1',
};

describe('CreateSubjectUseCase', () => {
  let useCase: CreateSubjectUseCase;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let careerRepo: jest.Mocked<ICareerRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;
  let subjectTeacherRepo: jest.Mocked<ISubjectTeacherRepository>;
  let notificationClient: jest.Mocked<INotificationClientPort>;
  let userProfilePort: jest.Mocked<IUserProfilePort>;

  beforeEach(() => {
    subjectRepo = mockSubjectRepo();
    careerRepo = mockCareerRepo();
    periodRepo = mockPeriodRepo();
    subjectTeacherRepo = mockSubjectTeacherRepo();
    notificationClient = mockNotificationClient();
    userProfilePort = mockUserProfilePort();
    useCase = new CreateSubjectUseCase(
      subjectRepo,
      careerRepo,
      periodRepo,
      subjectTeacherRepo,
      notificationClient,
      userProfilePort,
    );
  });

  it('creates subject correctly when career and period are valid', async () => {
    careerRepo.findById.mockResolvedValue(makeCareer());
    periodRepo.findActive.mockResolvedValue(makePeriod('ACTIVE'));
    subjectRepo.findByNameAndPeriod.mockResolvedValue(null);
    subjectRepo.findByCode.mockResolvedValue(null);
    subjectRepo.save.mockImplementation(async (s) => s);
    subjectTeacherRepo.save.mockImplementation(async (a) => a);

    const result = await useCase.execute(validDto, 'teacher-1');

    expect(result.name).toBe('Prog Web');
    expect(result.code).toBe('PW-701');
    expect(result.isActive).toBe(true);
    expect(result.maxCapacity).toBe(30);
    expect(result.id).toBeDefined();
    expect(subjectRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when career does not exist', async () => {
    periodRepo.findActive.mockResolvedValue(makePeriod('ACTIVE'));
    careerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(validDto, 'teacher-1')).rejects.toThrow(NotFoundException);
    expect(subjectRepo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when there is no active period', async () => {
    periodRepo.findActive.mockResolvedValue(null);

    await expect(useCase.execute(validDto, 'teacher-1')).rejects.toThrow(ConflictException);
    expect(subjectRepo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when subject with same name already exists in period', async () => {
    careerRepo.findById.mockResolvedValue(makeCareer());
    periodRepo.findActive.mockResolvedValue(makePeriod('ACTIVE'));
    subjectRepo.findByNameAndPeriod.mockResolvedValue(makeExistingSubject());

    await expect(useCase.execute(validDto, 'teacher-1')).rejects.toThrow(ConflictException);
    expect(subjectRepo.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when the code already exists', async () => {
    careerRepo.findById.mockResolvedValue(makeCareer());
    periodRepo.findActive.mockResolvedValue(makePeriod('ACTIVE'));
    subjectRepo.findByNameAndPeriod.mockResolvedValue(null);
    subjectRepo.findByCode.mockResolvedValue(makeExistingSubject());

    await expect(useCase.execute(validDto, 'teacher-1')).rejects.toThrow(ConflictException);
    expect(subjectRepo.save).not.toHaveBeenCalled();
  });

  it('normalizes the code (trim + uppercase) before checking and saving', async () => {
    careerRepo.findById.mockResolvedValue(makeCareer());
    periodRepo.findActive.mockResolvedValue(makePeriod('ACTIVE'));
    subjectRepo.findByNameAndPeriod.mockResolvedValue(null);
    subjectRepo.findByCode.mockResolvedValue(null);
    subjectRepo.save.mockImplementation(async (s) => s);
    subjectTeacherRepo.save.mockImplementation(async (a) => a);

    await useCase.execute({ ...validDto, code: '  pw-701  ' }, 'teacher-1');

    expect(subjectRepo.findByCode).toHaveBeenCalledWith('PW-701');
    expect(subjectRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PW-701' }),
    );
  });
});
