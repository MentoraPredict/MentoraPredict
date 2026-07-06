import { BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterGradeUseCase } from '../register-grade.use-case';
import { IGradeRepository } from '../../ports/output/i-grade.repository';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';
import { GradeEntity } from '../../../domain/entities/grade.entity';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';
import { GradeEventProducer } from '../../../infrastructure/messaging/grade-event.producer';

const mockGradeRepo = (): jest.Mocked<IGradeRepository> => ({
  findById: jest.fn(),
  findByStudentAndEvaluation: jest.fn(),
  findByStudentAndSubject: jest.fn(),
  findAllByStudentAndSubject: jest.fn(),
  findByStudentId: jest.fn(),
  findByEvaluationId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockEnrollRepo = (): jest.Mocked<IEnrollmentRepository> => ({
  findById: jest.fn(),
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

const mockEventProducer = (): jest.Mocked<Pick<GradeEventProducer, 'gradeRecorded'>> => ({
  gradeRecorded: jest.fn().mockResolvedValue(undefined),
});

const makeSubject = () =>
  new SubjectEntity('subj-1', 'Math', '', 'MAT101', 3, 'career-1', 'period-1', 30, 'teacher-1', true, new Date(), new Date());

const makePeriod = () =>
  new AcademicPeriodEntity('period-1', '2025-1', '2025-1', '', new Date(), new Date(), 'ACTIVE', 'SEMESTER', new Date(), new Date());

describe('RegisterGradeUseCase', () => {
  let useCase: RegisterGradeUseCase;
  let gradeRepo: jest.Mocked<IGradeRepository>;
  let enrollRepo: jest.Mocked<IEnrollmentRepository>;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;
  let eventProducer: jest.Mocked<Pick<GradeEventProducer, 'gradeRecorded'>>;

  beforeEach(() => {
    gradeRepo = mockGradeRepo();
    enrollRepo = mockEnrollRepo();
    subjectRepo = mockSubjectRepo();
    periodRepo = mockPeriodRepo();
    eventProducer = mockEventProducer();
    useCase = new RegisterGradeUseCase(
      gradeRepo,
      enrollRepo,
      subjectRepo,
      periodRepo,
      eventProducer as unknown as GradeEventProducer,
    );
  });

  it('registers a valid grade for enrolled student', async () => {
    enrollRepo.findByStudentAndSubject.mockResolvedValue(
      new EnrollmentEntity('e1', 'stud-1', 'subj-1', 'period-1', 'ACTIVE', new Date(), new Date()),
    );
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    gradeRepo.findByStudentAndSubject.mockResolvedValue(null);
    gradeRepo.save.mockImplementation(async (g) => g);

    const result = await useCase.execute(
      { studentId: 'stud-1', subjectId: 'subj-1', grade: 8.5 },
      'teacher-1',
    );

    expect(result.value).toBe(8.5);
    expect(result.registeredBy).toBe('teacher-1');
    expect(gradeRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws when student is not enrolled', async () => {
    enrollRepo.findByStudentAndSubject.mockResolvedValue(null);
    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1', grade: 7 }, 'teacher-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when grade already exists', async () => {
    enrollRepo.findByStudentAndSubject.mockResolvedValue(
      new EnrollmentEntity('e1', 'stud-1', 'subj-1', 'period-1', 'ACTIVE', new Date(), new Date()),
    );
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    const now = new Date();
    gradeRepo.findByStudentAndSubject.mockResolvedValue(
      new GradeEntity('g1', 'stud-1', 'subj-1', 7, 't1', now, now, now),
    );

    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1', grade: 9 }, 'teacher-1'),
    ).rejects.toThrow(ConflictException);
  });
});
