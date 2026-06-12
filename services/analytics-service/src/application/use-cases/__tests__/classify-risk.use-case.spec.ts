import { ClassifyRiskUseCase } from '../classify-risk.use-case';

describe('ClassifyRiskUseCase', () => {
  const useCase = new ClassifyRiskUseCase(40, 25);

  it('returns CRITICAL for very low composite score', () => {
    const result = useCase.execute({
      globalAverage: 2,
      complianceIndex: 20,
      attendance: 30,
      failedEvaluations: 5,
      trendSlope: -2,
      studyHours: 1,
    });
    expect(result.riskLevel).toBe('CRITICAL');
  });

  it('returns LOW for strong performance', () => {
    const result = useCase.execute({
      globalAverage: 9,
      complianceIndex: 95,
      attendance: 95,
      failedEvaluations: 0,
      trendSlope: 1,
      studyHours: 8,
    });
    expect(result.riskLevel).toBe('LOW');
  });
});
