import { ClassifyRiskUseCase } from '../classify-risk.use-case';

describe('ClassifyRiskUseCase', () => {
  const useCase = new ClassifyRiskUseCase(40, 25);

  it('returns CRITICAL for very low composite score', () => {
    const result = useCase.execute({
      globalAverage: 4,
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
      globalAverage: 18,
      complianceIndex: 95,
      attendance: 95,
      failedEvaluations: 0,
      trendSlope: 1,
      studyHours: 8,
    });
    expect(result.riskLevel).toBe('LOW');
  });

  it('escalates to at least MEDIUM when the average is failing, even with strong other factors', () => {
    const result = useCase.execute({
      globalAverage: 12,
      complianceIndex: 95,
      attendance: 95,
      failedEvaluations: 0,
      trendSlope: 1,
      studyHours: 8,
    });
    expect(result.riskLevel).toBe('MEDIUM');
  });

  it('escalates to at least HIGH when the average is severely failing, even with strong other factors', () => {
    const result = useCase.execute({
      globalAverage: 7,
      complianceIndex: 95,
      attendance: 95,
      failedEvaluations: 0,
      trendSlope: 1,
      studyHours: 8,
    });
    expect(result.riskLevel).toBe('HIGH');
  });

  it('never downgrades a worse classification the composite score already produced', () => {
    const result = useCase.execute({
      globalAverage: 4,
      complianceIndex: 20,
      attendance: 30,
      failedEvaluations: 5,
      trendSlope: -2,
      studyHours: 1,
    });
    expect(result.riskLevel).toBe('CRITICAL');
  });

  it('leaves a passing average unaffected by the failing-grade floor', () => {
    const result = useCase.execute({
      globalAverage: 14,
      complianceIndex: 95,
      attendance: 95,
      failedEvaluations: 0,
      trendSlope: 1,
      studyHours: 8,
    });
    expect(result.riskLevel).toBe('LOW');
  });
});
