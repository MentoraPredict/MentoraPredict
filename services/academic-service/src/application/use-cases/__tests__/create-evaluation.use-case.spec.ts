import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateEvaluationUseCase } from '../create-evaluation.use-case';
import { IEvaluationRepository } from '../../ports/output/i-evaluation.repository';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { EvaluationEntity } from '../../../domain/entities/evaluation.entity';

const makeSubject = (active = true) =>
  new SubjectEntity('subj-1', 'Prog Web', 'PW-701', 4, 'period-1', null, active, new Date(), new Date());

const mockEvalRepo   = (): jest.Mocked<IEvaluationRepository>  => ({ findById: jest.fn(), findBySubjectId: jest.fn(), getTotalWeightForSubject: jest.fn(), save: jest.fn() });
const mockSubjectRepo = (): jest.Mocked<ISubjectRepository>    => ({ findById: jest.fn(), findByPeriodId: jest.fn(), save: jest.fn(), update: jest.fn() });

describe('CreateEvaluationUseCase', () => {
  let useCase: CreateEvaluationUseCase;
  let evalRepo: jest.Mocked<IEvaluationRepository>;
  let subjectRepo: jest.Mocked<ISubjectRepository>;

  beforeEach(() => {
    evalRepo    = mockEvalRepo();
    subjectRepo = mockSubjectRepo();
    useCase = new CreateEvaluationUseCase(evalRepo, subjectRepo);
  });

  it('creates evaluation when total weight stays ≤ 100', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    evalRepo.getTotalWeightForSubject.mockResolvedValue(50);
    evalRepo.save.mockImplementation(async (e) => e);

    const result = await useCase.execute({ name: 'Parcial 2', weight: 30, subjectId: 'subj-1' });
    expect(result.name).toBe('Parcial 2');
    expect(result.weight).toBe(30);
  });

  it('throws BadRequestException when weight would exceed 100', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    evalRepo.getTotalWeightForSubject.mockResolvedValue(80);
    await expect(useCase.execute({ name: 'Extra', weight: 30, subjectId: 'subj-1' }))
      .rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException for inactive subject', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject(false));
    await expect(useCase.execute({ name: 'P1', weight: 30, subjectId: 'subj-1' }))
      .rejects.toThrow(NotFoundException);
  });

  it('allows exactly 100% total weight', async () => {
    subjectRepo.findById.mockResolvedValue(makeSubject());
    evalRepo.getTotalWeightForSubject.mockResolvedValue(70);
    evalRepo.save.mockImplementation(async (e) => e);
    const result = await useCase.execute({ name: 'Final', weight: 30, subjectId: 'subj-1' });
    expect(result.weight).toBe(30);
  });
});
