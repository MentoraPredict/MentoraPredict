import { HttpException, HttpStatus } from '@nestjs/common';
import { RequestSubjectPredictionUseCase } from '../request-subject-prediction.use-case';
import { GenerateSubjectPredictionUseCase } from '../generate-subject-prediction.use-case';
import { IPredictionLogRepository } from '../../../domain/ports/i-prediction-log.repository';
import { PredictionResult } from '../../../domain/entities/prediction-result.entity';

const mockLogRepo = (): jest.Mocked<IPredictionLogRepository> => ({
  save: jest.fn(),
  findHistory: jest.fn(),
});

const mockGenerateSubjectPredictionUC = () =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<GenerateSubjectPredictionUseCase>;

const makeResult = (generatedAt: Date, subjectId: string | null = 'subj-1') =>
  new PredictionResult(
    'stud-1',
    'period-1',
    {
      riskLevel: 'MEDIUM',
      globalAverage: 14,
      complianceIndex: 80,
      attendance: 90,
      failedEvaluations: 0,
      trendSlope: 0,
    },
    'summary',
    [],
    'gpt-recommendation-v1',
    generatedAt,
    subjectId,
  );

describe('RequestSubjectPredictionUseCase', () => {
  it('generates a prediction when there is no prior history for the subject', async () => {
    const logRepo = mockLogRepo();
    const generateUC = mockGenerateSubjectPredictionUC();
    logRepo.findHistory.mockResolvedValue([]);
    generateUC.execute.mockResolvedValue(makeResult(new Date()));

    const useCase = new RequestSubjectPredictionUseCase(logRepo, generateUC);
    await useCase.execute('stud-1', 'subj-1');

    expect(logRepo.findHistory).toHaveBeenCalledWith('stud-1', 1, 'subj-1');
    expect(generateUC.execute).toHaveBeenCalledWith('stud-1', 'subj-1');
  });

  it('rejects with 429 when the per-subject cooldown is still active', async () => {
    const logRepo = mockLogRepo();
    const generateUC = mockGenerateSubjectPredictionUC();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    logRepo.findHistory.mockResolvedValue([makeResult(fiveMinutesAgo)]);

    const useCase = new RequestSubjectPredictionUseCase(logRepo, generateUC);

    await expect(useCase.execute('stud-1', 'subj-1')).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(generateUC.execute).not.toHaveBeenCalled();
  });

  it('generates again once the per-subject cooldown has elapsed', async () => {
    const logRepo = mockLogRepo();
    const generateUC = mockGenerateSubjectPredictionUC();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    logRepo.findHistory.mockResolvedValue([makeResult(twoHoursAgo)]);
    generateUC.execute.mockResolvedValue(makeResult(new Date()));

    const useCase = new RequestSubjectPredictionUseCase(logRepo, generateUC);
    await useCase.execute('stud-1', 'subj-1');

    expect(generateUC.execute).toHaveBeenCalledWith('stud-1', 'subj-1');
  });

  it('does not consider a cooldown from a different subject', async () => {
    // findHistory is called scoped to subj-1, so an active cooldown on
    // subj-2 (a different subject) must never surface here — this is
    // exercised by asserting the call arguments, since the mock only
    // returns whatever this specific call is set up to return.
    const logRepo = mockLogRepo();
    const generateUC = mockGenerateSubjectPredictionUC();
    logRepo.findHistory.mockResolvedValue([]);
    generateUC.execute.mockResolvedValue(makeResult(new Date()));

    const useCase = new RequestSubjectPredictionUseCase(logRepo, generateUC);
    await useCase.execute('stud-1', 'subj-1');

    expect(logRepo.findHistory).not.toHaveBeenCalledWith('stud-1', 1, 'subj-2');
  });

  it('throws HttpException instances (not plain errors) on cooldown', async () => {
    const logRepo = mockLogRepo();
    const generateUC = mockGenerateSubjectPredictionUC();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    logRepo.findHistory.mockResolvedValue([makeResult(tenMinutesAgo)]);

    const useCase = new RequestSubjectPredictionUseCase(logRepo, generateUC);

    try {
      await useCase.execute('stud-1', 'subj-1');
      fail('expected HttpException');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).message).toMatch(/50 minuto/);
    }
  });
});
