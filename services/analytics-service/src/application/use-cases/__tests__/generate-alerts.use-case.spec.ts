import { GenerateAlertsUseCase } from '../generate-alerts.use-case';
import { IAlertRepository } from '../../../domain/ports/i-alert.repository';

const mockAlertRepo = (): jest.Mocked<IAlertRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByStudentId: jest.fn(),
  findActiveByStudentAndSubject: jest.fn(),
  findByStudentPaginated: jest.fn(),
  findBySubjectPaginated: jest.fn(),
});

describe('GenerateAlertsUseCase', () => {
  it('creates alerts for high risk and low attendance', async () => {
    const repo = mockAlertRepo();
    repo.save.mockImplementation(async (a) => a);
    repo.findByStudentPaginated.mockResolvedValue({ items: [], total: 0 });
    const useCase = new GenerateAlertsUseCase(repo);

    const alerts = await useCase.execute('s1', {
      subjectId: 'subj-1',
      riskLevel: 'HIGH',
      currentAverage: 5,
      previousAverage: 8,
      failedEvaluations: 4,
      attendance: 60,
    });

    expect(alerts.length).toBeGreaterThanOrEqual(3);
    expect(repo.save).toHaveBeenCalled();
  });

  it('skips a check whose alert type is already unread for the subject', async () => {
    const repo = mockAlertRepo();
    repo.save.mockImplementation(async (a) => a);
    repo.findByStudentPaginated.mockResolvedValue({
      items: [
        {
          type: 'RISK_HIGH',
        } as never,
      ],
      total: 1,
    });
    const useCase = new GenerateAlertsUseCase(repo);

    const alerts = await useCase.execute('s1', {
      subjectId: 'subj-1',
      riskLevel: 'HIGH',
      currentAverage: 5,
      failedEvaluations: 0,
      attendance: 90,
    });

    expect(alerts.some((a) => a.type === 'RISK_HIGH')).toBe(false);
  });
});
