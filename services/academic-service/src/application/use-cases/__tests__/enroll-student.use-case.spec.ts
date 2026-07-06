import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollStudentUseCase } from '../enroll-student.use-case';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../../ports/output/i-subject-teacher.repository';
import { IUserProfilePort } from '../../ports/output/i-user-profile.port';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

const period = new AcademicPeriodEntity(
  'period-1', '2025-1', '2025-1', '', new Date(), new Date(), 'ACTIVE', 'SEMESTER', new Date(), new Date(),
);
const subject = new SubjectEntity(
  'subj-1', 'Math', '', 'MAT101', 3, 'career-1', 'period-1', 30,
  null, true, new Date(), new Date(),
);

const mockEnrollRepo = (): jest.Mocked<IEnrollmentRepository> => ({
  findByStudentAndSubject: jest.fn(),
  findByStudentSubjectAndPeriod: jest.fn(),
  countActiveBySubject: jest.fn(),
  findByStudentId: jest.fn(),
  findBySubjectIdPaginated: jest.fn(),
  findByStudentIdWithDetails: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  saveWithCapacityCheck: jest.fn(),
});

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

const mockUserProfilePort = (): jest.Mocked<IUserProfilePort> => ({
  getProfile: jest.fn(),
});

const studentProfile = {
  id: 'stud-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'STUDENT',
  status: 'ACTIVE',
};

describe('EnrollStudentUseCase', () => {
  let useCase: EnrollStudentUseCase;
  let enrollRepo: jest.Mocked<IEnrollmentRepository>;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;
  let subjectTeacherRepo: jest.Mocked<ISubjectTeacherRepository>;
  let userProfilePort: jest.Mocked<IUserProfilePort>;

  beforeEach(() => {
    enrollRepo = mockEnrollRepo();
    subjectRepo = mockSubjectRepo();
    periodRepo = mockPeriodRepo();
    subjectTeacherRepo = mockSubjectTeacherRepo();
    userProfilePort = mockUserProfilePort();
    useCase = new EnrollStudentUseCase(
      enrollRepo,
      subjectRepo,
      periodRepo,
      subjectTeacherRepo,
      userProfilePort,
    );
  });

  it('enrolls student when period is active and capacity available', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(period);
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue({} as never);
    userProfilePort.getProfile.mockResolvedValue(studentProfile);
    enrollRepo.saveWithCapacityCheck.mockResolvedValue('enrolled');

    const result = await useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }, 'teacher-1');

    expect(result.studentId).toBe('stud-1');
    expect(result.periodId).toBe('period-1');
    expect(result.status).toBe('ACTIVE');
  });

  it('throws when subject is inactive', async () => {
    subjectRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }, 'teacher-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when period is not active', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(
      new AcademicPeriodEntity('period-1', '2025-1', '2025-1', '', new Date(), new Date(), 'PLANNED', 'SEMESTER', new Date(), new Date()),
    );
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }, 'teacher-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when capacity is full', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(period);
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue({} as never);
    userProfilePort.getProfile.mockResolvedValue(studentProfile);
    enrollRepo.saveWithCapacityCheck.mockResolvedValue('at_capacity');
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }, 'teacher-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws on duplicate active enrollment', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(period);
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue({} as never);
    userProfilePort.getProfile.mockResolvedValue(studentProfile);
    enrollRepo.saveWithCapacityCheck.mockResolvedValue('already_enrolled');
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }, 'teacher-1'),
    ).rejects.toThrow(ConflictException);
  });
});
