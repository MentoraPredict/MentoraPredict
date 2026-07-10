import { NotFoundException } from '@nestjs/common';
import { GenerateSubjectPredictionUseCase } from '../generate-subject-prediction.use-case';
import { IAnalyticsClient, LatestSubjectMetric } from '../../ports/output/i-analytics.client';
import { IAcademicContextClient } from '../../ports/output/i-academic-context.client';
import { IAiRecommendationProvider } from '../../ports/output/i-ai-recommendation.provider';
import { IPredictionLogRepository } from '../../../domain/ports/i-prediction-log.repository';

const mockAnalyticsClient = (): jest.Mocked<IAnalyticsClient> => ({
  getRiskSnapshot: jest.fn(),
  getLatestSubjectMetric: jest.fn(),
});

const mockAcademicClient = (): jest.Mocked<IAcademicContextClient> => ({
  getStudentContext: jest.fn(),
  getEnrollmentsByStudent: jest.fn(),
  getSubjectOwnership: jest.fn(),
  getSubjectGradesContext: jest.fn(),
  getSubjectTopics: jest.fn(),
});

const mockAiProvider = (): jest.Mocked<IAiRecommendationProvider> => ({
  generate: jest.fn(),
});

const mockLogRepo = (): jest.Mocked<IPredictionLogRepository> => ({
  save: jest.fn(),
  findHistory: jest.fn(),
});

const activeEnrollment = {
  studentId: 'stud-1',
  subjectId: 'subj-1',
  periodId: 'period-1',
  status: 'ACTIVE',
};

const fullMetric: LatestSubjectMetric = {
  averageGrade: 15,
  riskLevel: 'MEDIUM',
  trendSlope: 0.1,
  complianceIndex: 80,
  attendanceRate: 90,
  studyHours: 5,
  comprehensionAvg: 70,
  computedAt: new Date().toISOString(),
};

describe('GenerateSubjectPredictionUseCase', () => {
  it('throws NotFoundException when the student is not actively enrolled', async () => {
    const analyticsClient = mockAnalyticsClient();
    const academicClient = mockAcademicClient();
    const aiProvider = mockAiProvider();
    const logRepo = mockLogRepo();
    academicClient.getEnrollmentsByStudent.mockResolvedValue([]);

    const useCase = new GenerateSubjectPredictionUseCase(analyticsClient, academicClient, aiProvider, logRepo);

    await expect(useCase.execute('stud-1', 'subj-1')).rejects.toThrow(NotFoundException);
    expect(analyticsClient.getLatestSubjectMetric).not.toHaveBeenCalled();
  });

  it('returns a nudge to complete the weekly check-in when there is not enough data, without calling OpenAI', async () => {
    const analyticsClient = mockAnalyticsClient();
    const academicClient = mockAcademicClient();
    const aiProvider = mockAiProvider();
    const logRepo = mockLogRepo();
    academicClient.getEnrollmentsByStudent.mockResolvedValue([activeEnrollment]);
    analyticsClient.getLatestSubjectMetric.mockResolvedValue(null);
    academicClient.getSubjectGradesContext.mockResolvedValue({
      subjectName: 'Matematicas',
      credits: 3,
      currentGrade: null,
      failedEvaluations: 0,
    });
    academicClient.getSubjectTopics.mockResolvedValue([]);
    logRepo.save.mockResolvedValue(undefined);

    const useCase = new GenerateSubjectPredictionUseCase(analyticsClient, academicClient, aiProvider, logRepo);
    const result = await useCase.execute('stud-1', 'subj-1');

    expect(aiProvider.generate).not.toHaveBeenCalled();
    expect(result.subjectId).toBe('subj-1');
    expect(result.summary).toMatch(/Matematicas/);
  });

  it('grounds the AI request in the subject metrics and syllabus topics, and persists with subjectId', async () => {
    const analyticsClient = mockAnalyticsClient();
    const academicClient = mockAcademicClient();
    const aiProvider = mockAiProvider();
    const logRepo = mockLogRepo();
    academicClient.getEnrollmentsByStudent.mockResolvedValue([activeEnrollment]);
    analyticsClient.getLatestSubjectMetric.mockResolvedValue(fullMetric);
    academicClient.getSubjectGradesContext.mockResolvedValue({
      subjectName: 'Matematicas',
      credits: 3,
      currentGrade: 15,
      failedEvaluations: 1,
    });
    academicClient.getSubjectTopics.mockResolvedValue(['Unidad 1', 'Unidad 2']);
    aiProvider.generate.mockResolvedValue({
      summary: 'resumen',
      recommendations: [
        { type: 'STUDY_HABIT', title: 'titulo', reason: 'razon', priority: 'MEDIUM' },
      ],
    });
    logRepo.save.mockResolvedValue(undefined);

    const useCase = new GenerateSubjectPredictionUseCase(analyticsClient, academicClient, aiProvider, logRepo);
    const result = await useCase.execute('stud-1', 'subj-1');

    expect(aiProvider.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        topics: ['Unidad 1', 'Unidad 2'],
        subjects: [{ name: 'Matematicas', currentGrade: 15, credits: 3 }],
        risk: expect.objectContaining({ riskLevel: 'MEDIUM', failedEvaluations: 1 }),
      }),
    );
    expect(result.subjectId).toBe('subj-1');
    expect(logRepo.save).toHaveBeenCalledWith(expect.objectContaining({ subjectId: 'subj-1' }));
  });

  it('falls back to a deterministic recommendation when OpenAI fails', async () => {
    const analyticsClient = mockAnalyticsClient();
    const academicClient = mockAcademicClient();
    const aiProvider = mockAiProvider();
    const logRepo = mockLogRepo();
    academicClient.getEnrollmentsByStudent.mockResolvedValue([activeEnrollment]);
    analyticsClient.getLatestSubjectMetric.mockResolvedValue(fullMetric);
    academicClient.getSubjectGradesContext.mockResolvedValue({
      subjectName: 'Matematicas',
      credits: 3,
      currentGrade: 15,
      failedEvaluations: 0,
    });
    academicClient.getSubjectTopics.mockResolvedValue([]);
    aiProvider.generate.mockRejectedValue(new Error('OpenAI unreachable'));
    logRepo.save.mockResolvedValue(undefined);

    const useCase = new GenerateSubjectPredictionUseCase(analyticsClient, academicClient, aiProvider, logRepo);
    const result = await useCase.execute('stud-1', 'subj-1');

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.summary).toMatch(/Matematicas/);
  });
});
