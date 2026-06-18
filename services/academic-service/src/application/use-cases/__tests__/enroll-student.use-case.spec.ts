import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollStudentUseCase } from '../enroll-student.use-case';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';
import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';

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
  save: jest.fn(),
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

describe('EnrollStudentUseCase', () => {
  let useCase: EnrollStudentUseCase;
  let enrollRepo: jest.Mocked<IEnrollmentRepository>;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;

  beforeEach(() => {
    enrollRepo = mockEnrollRepo();
    subjectRepo = mockSubjectRepo();
    periodRepo = mockPeriodRepo();
    useCase = new EnrollStudentUseCase(enrollRepo, subjectRepo, periodRepo);
  });

  it('enrolls student when period is active and capacity available', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(period);
    enrollRepo.countActiveBySubject.mockResolvedValue(5);
    enrollRepo.findByStudentSubjectAndPeriod.mockResolvedValue(null);
    enrollRepo.save.mockImplementation(async (e) => e);

    const result = await useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' });

    expect(result.studentId).toBe('stud-1');
    expect(result.periodId).toBe('period-1');
    expect(result.status).toBe('ACTIVE');
  });

  it('throws when subject is inactive', async () => {
    subjectRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when period is not active', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(
      new AcademicPeriodEntity('period-1', '2025-1', '2025-1', '', new Date(), new Date(), 'PLANNED', 'SEMESTER', new Date(), new Date()),
    );
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when capacity is full', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(period);
    enrollRepo.countActiveBySubject.mockResolvedValue(30);
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws on duplicate active enrollment', async () => {
    subjectRepo.findById.mockResolvedValue(subject);
    periodRepo.findById.mockResolvedValue(period);
    enrollRepo.countActiveBySubject.mockResolvedValue(1);
    enrollRepo.findByStudentSubjectAndPeriod.mockResolvedValue(
      new EnrollmentEntity('e1', 'stud-1', 'subj-1', 'period-1', 'ACTIVE', new Date(), new Date()),
    );
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1' }),
    ).rejects.toThrow(ConflictException);
  });
});
