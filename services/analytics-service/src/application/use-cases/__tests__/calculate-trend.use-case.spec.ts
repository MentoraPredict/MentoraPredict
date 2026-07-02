import { BadRequestException } from '@nestjs/common';
import { CalculateTrendUseCase } from '../calculate-trend.use-case';
import { IStudentMetricsRepository } from '../../../domain/ports/i-student-metrics.repository';
import { IDatasetVersionRepository } from '../../../domain/ports/i-dataset-version.repository';
import { StudentMetricsEntity } from '../../../domain/entities/student-metrics.entity';

const mockMetricsRepo = (): jest.Mocked<IStudentMetricsRepository> => ({
  findByStudentAndPeriod: jest.fn(),
  findLatestByStudent: jest.fn(),
  findByPeriod: jest.fn(),
  findLatestPerStudent: jest.fn(),
  save: jest.fn(),
});

const mockDatasetRepo = (): jest.Mocked<IDatasetVersionRepository> => ({
  save: jest.fn(),
});

describe('CalculateTrendUseCase', () => {
  it('throws when fewer than 3 periods provided', async () => {
    const useCase = new CalculateTrendUseCase(mockMetricsRepo(), mockDatasetRepo());
    await expect(useCase.execute('s1', ['p1', 'p2'])).rejects.toThrow(BadRequestException);
  });

  it('classifies ascending trend', async () => {
    const metricsRepo = mockMetricsRepo();
    const datasetRepo = mockDatasetRepo();
    metricsRepo.findByStudentAndPeriod
      .mockResolvedValueOnce(new StudentMetricsEntity('m1', 's1', 'p1', {}, 5, new Date(), 1))
      .mockResolvedValueOnce(new StudentMetricsEntity('m2', 's1', 'p2', {}, 6, new Date(), 1))
      .mockResolvedValueOnce(new StudentMetricsEntity('m3', 's1', 'p3', {}, 9, new Date(), 1));

    const useCase = new CalculateTrendUseCase(metricsRepo, datasetRepo);
    const result = await useCase.execute('s1', ['p1', 'p2', 'p3']);

    expect(result.classification).toBe('ASCENDING');
    expect(result.periodsAnalyzed).toBe(3);
    expect(datasetRepo.save).toHaveBeenCalled();
  });
});
