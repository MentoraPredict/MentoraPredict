import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RecordGradeUseCase } from '../record-grade.use-case';
import { IGradeRepository } from '../../ports/output/i-grade.repository';
import { IEvaluationRepository } from '../../ports/output/i-evaluation.repository';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { EvaluationEntity } from '../../../domain/entities/evaluation.entity';
import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';

const makeEval = () => new EvaluationEntity('eval-1', 'Parcial 1', 30, 'subj-1', null, true, new Date(), new Date());
const makeEnroll = (status: 'ACTIVE' | 'WITHDRAWN' = 'ACTIVE') =>
  new EnrollmentEntity('enr-1', 'stud-1', 'subj-1', status, new Date(), new Date());

const mockGradeRepo   = (): jest.Mocked<IGradeRepository>   => ({ findByStudentAndEvaluation: jest.fn(), findByStudentId: jest.fn(), findByEvaluationId: jest.fn(), save: jest.fn() });
const mockEvalRepo    = (): jest.Mocked<IEvaluationRepository>  => ({ findById: jest.fn(), findBySubjectId: jest.fn(), getTotalWeightForSubject: jest.fn(), save: jest.fn() });
const mockEnrollRepo  = (): jest.Mocked<IEnrollmentRepository> => ({ findByStudentAndSubject: jest.fn(), findByStudentId: jest.fn(), save: jest.fn() });

describe('RecordGradeUseCase', () => {
  let useCase: RecordGradeUseCase;
  let gradeRepo: jest.Mocked<IGradeRepository>;
  let evalRepo:  jest.Mocked<IEvaluationRepository>;
  let enrollRepo: jest.Mocked<IEnrollmentRepository>;

  beforeEach(() => {
    gradeRepo  = mockGradeRepo();
    evalRepo   = mockEvalRepo();
    enrollRepo = mockEnrollRepo();
    useCase = new RecordGradeUseCase(gradeRepo, evalRepo, enrollRepo);
  });

  it('saves a valid grade for an enrolled student', async () => {
    evalRepo.findById.mockResolvedValue(makeEval());
    enrollRepo.findByStudentAndSubject.mockResolvedValue(makeEnroll());
    gradeRepo.findByStudentAndEvaluation.mockResolvedValue(null);
    gradeRepo.save.mockImplementation(async (g) => g);

    const result = await useCase.execute({ studentId: 'stud-1', evaluationId: 'eval-1', value: 8.5 }, 'teacher-1');

    expect(result.value).toBe(8.5);
    expect(result.studentId).toBe('stud-1');
    expect(gradeRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException if evaluation does not exist', async () => {
    evalRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 'stud-1', evaluationId: 'bad-id', value: 7 }, 'teacher-1'))
      .rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException if student is not enrolled', async () => {
    evalRepo.findById.mockResolvedValue(makeEval());
    enrollRepo.findByStudentAndSubject.mockResolvedValue(null);
    await expect(useCase.execute({ studentId: 'stud-1', evaluationId: 'eval-1', value: 7 }, 'teacher-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('throws ConflictException if grade already exists', async () => {
    const { GradeEntity } = require('../../../domain/entities/grade.entity');
    evalRepo.findById.mockResolvedValue(makeEval());
    enrollRepo.findByStudentAndSubject.mockResolvedValue(makeEnroll());
    gradeRepo.findByStudentAndEvaluation.mockResolvedValue(
      new GradeEntity('g-1', 'stud-1', 'eval-1', 7, 'teacher-1', new Date(), new Date(), new Date())
    );
    await expect(useCase.execute({ studentId: 'stud-1', evaluationId: 'eval-1', value: 8 }, 'teacher-1'))
      .rejects.toThrow(ConflictException);
  });

  it('domain entity rejects grade value > 10', () => {
    const { GradeEntity } = require('../../../domain/entities/grade.entity');
    expect(() => new GradeEntity('g-1', 'stud-1', 'eval-1', 11, 'teacher-1', new Date(), new Date(), new Date()))
      .toThrow('Grade value must be between 0 and 10');
  });

  it('domain entity rejects grade value < 0', () => {
    const { GradeEntity } = require('../../../domain/entities/grade.entity');
    expect(() => new GradeEntity('g-1', 'stud-1', 'eval-1', -1, 'teacher-1', new Date(), new Date(), new Date()))
      .toThrow('Grade value must be between 0 and 10');
  });
});
