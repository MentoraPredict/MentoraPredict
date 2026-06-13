import { CalculateComplianceUseCase } from '../calculate-compliance.use-case';
import { IDatasetVersionRepository } from '../../../domain/ports/i-dataset-version.repository';

const mockDatasetRepo = (): jest.Mocked<IDatasetVersionRepository> => ({
  save: jest.fn(),
});

describe('CalculateComplianceUseCase', () => {
  it('computes weighted compliance index and classification', async () => {
    const datasetRepo = mockDatasetRepo();
    const useCase = new CalculateComplianceUseCase(datasetRepo);

    const result = await useCase.execute('s1', {
      asistencia: 90,
      tareas: 80,
      evaluaciones: 85,
      participacion: 70,
    });

    expect(result.index).toBe(84);
    expect(result.classification).toBe('GOOD');
    expect(datasetRepo.save).toHaveBeenCalled();
  });
});
