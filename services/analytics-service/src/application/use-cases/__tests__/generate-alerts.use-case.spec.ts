import { GenerateAlertsUseCase } from '../generate-alerts.use-case';
import { IAlertRepository } from '../../../domain/ports/i-alert.repository';

const mockAlertRepo = (): jest.Mocked<IAlertRepository> => ({
  save: jest.fn(),
  findByStudentId: jest.fn(),
});

describe('GenerateAlertsUseCase', () => {
  it('creates alerts for high risk and low attendance', async () => {
    const repo = mockAlertRepo();
    repo.save.mockImplementation(async (a) => a);
    const useCase = new GenerateAlertsUseCase(repo);

    const alerts = await useCase.execute('s1', {
      riskLevel: 'HIGH',
      currentAverage: 5,
      previousAverage: 8,
      failedEvaluations: 4,
      attendance: 60,
    });

    expect(alerts.length).toBeGreaterThanOrEqual(3);
    expect(repo.save).toHaveBeenCalled();
  });
});
