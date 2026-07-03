import { BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterGradeUseCase } from '../register-grade.use-case';
import { IGradeRepository } from '../../ports/output/i-grade.repository';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';
import { GradeEntity } from '../../../domain/entities/grade.entity';

const mockGradeRepo = (): jest.Mocked<IGradeRepository> => ({
  findById: jest.fn(),
  findByStudentAndEvaluation: jest.fn(),
  findByStudentAndSubject: jest.fn(),
  findByStudentId: jest.fn(),
  findByEvaluationId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockEnrollRepo = (): jest.Mocked<IEnrollmentRepository> => ({
  findByStudentAndSubject: jest.fn(),
  findByStudentSubjectAndPeriod: jest.fn(),
  countActiveBySubject: jest.fn(),
  findByStudentId: jest.fn(),
  findBySubjectId: jest.fn(),
  save: jest.fn(),
});

describe('RegisterGradeUseCase', () => {
  let useCase: RegisterGradeUseCase;
  let gradeRepo: jest.Mocked<IGradeRepository>;
  let enrollRepo: jest.Mocked<IEnrollmentRepository>;

  beforeEach(() => {
    gradeRepo = mockGradeRepo();
    enrollRepo = mockEnrollRepo();
    useCase = new RegisterGradeUseCase(gradeRepo, enrollRepo);
  });

  it('registers a valid grade for enrolled student', async () => {
    enrollRepo.findByStudentAndSubject.mockResolvedValue(
      new EnrollmentEntity('e1', 'stud-1', 'subj-1', 'period-1', 'ACTIVE', new Date(), new Date()),
    );
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
    const now = new Date();
    gradeRepo.findByStudentAndSubject.mockResolvedValue(
      new GradeEntity('g1', 'stud-1', 'subj-1', 7, 't1', now, now, now),
    );

    await expect(
      useCase.execute({ studentId: 'stud-1', subjectId: 'subj-1', grade: 9 }, 'teacher-1'),
    ).rejects.toThrow(ConflictException);
  });
});
