import { HttpException, HttpStatus } from '@nestjs/common';
import { RequestStudentPredictionUseCase } from '../request-student-prediction.use-case';
import { GeneratePredictionUseCase } from '../generate-prediction.use-case';
import { IPredictionLogRepository } from '../../../domain/ports/i-prediction-log.repository';
import { PredictionResult } from '../../../domain/entities/prediction-result.entity';

const mockLogRepo = (): jest.Mocked<IPredictionLogRepository> => ({
  save: jest.fn(),
  findHistory: jest.fn(),
});

const mockGeneratePredictionUC = () =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<GeneratePredictionUseCase>;

const makeResult = (generatedAt: Date) =>
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
  );

describe('RequestStudentPredictionUseCase', () => {
  it('generates a prediction when there is no prior history', async () => {
    const logRepo = mockLogRepo();
    const generatePredictionUC = mockGeneratePredictionUC();
    logRepo.findHistory.mockResolvedValue([]);
    generatePredictionUC.execute.mockResolvedValue(makeResult(new Date()));

    const useCase = new RequestStudentPredictionUseCase(logRepo, generatePredictionUC);
    const result = await useCase.execute('stud-1', 'period-1');

    expect(generatePredictionUC.execute).toHaveBeenCalledWith('stud-1', 'period-1');
    expect(result.studentId).toBe('stud-1');
  });

  it('generates a prediction when the last one is older than the cooldown', async () => {
    const logRepo = mockLogRepo();
    const generatePredictionUC = mockGeneratePredictionUC();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    logRepo.findHistory.mockResolvedValue([makeResult(twoHoursAgo)]);
    generatePredictionUC.execute.mockResolvedValue(makeResult(new Date()));

    const useCase = new RequestStudentPredictionUseCase(logRepo, generatePredictionUC);
    await useCase.execute('stud-1', 'period-1');

    expect(generatePredictionUC.execute).toHaveBeenCalledWith('stud-1', 'period-1');
  });

  it('rejects with 429 when the cooldown is still active', async () => {
    const logRepo = mockLogRepo();
    const generatePredictionUC = mockGeneratePredictionUC();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    logRepo.findHistory.mockResolvedValue([makeResult(fiveMinutesAgo)]);

    const useCase = new RequestStudentPredictionUseCase(logRepo, generatePredictionUC);

    await expect(useCase.execute('stud-1', 'period-1')).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(generatePredictionUC.execute).not.toHaveBeenCalled();
  });

  it('includes the retry-after wait time in the error message', async () => {
    const logRepo = mockLogRepo();
    const generatePredictionUC = mockGeneratePredictionUC();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    logRepo.findHistory.mockResolvedValue([makeResult(tenMinutesAgo)]);

    const useCase = new RequestStudentPredictionUseCase(logRepo, generatePredictionUC);

    try {
      await useCase.execute('stud-1', 'period-1');
      fail('expected HttpException');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).message).toMatch(/50 minuto/);
    }
  });
});
