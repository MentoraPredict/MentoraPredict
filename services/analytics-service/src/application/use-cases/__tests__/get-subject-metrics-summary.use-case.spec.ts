import { ForbiddenException } from '@nestjs/common';
import { GetSubjectMetricsSummaryUseCase } from '../get-subject-metrics-summary.use-case';
import { IStudentSubjectMetricsRepository, SubjectRiskCounts } from '../../../domain/ports/i-student-subject-metrics.repository';
import { IAcademicServiceClient } from '../../../domain/ports/i-academic-service.client';

const riskCounts: SubjectRiskCounts = { LOW: 3, MEDIUM: 1, HIGH: 0, CRITICAL: 0, unclassified: 0 };

const mockMetricsRepo = (): jest.Mocked<IStudentSubjectMetricsRepository> => ({
  upsert: jest.fn(),
  findLatestByStudentAndSubject: jest.fn(),
  findByStudentSubjectPaginated: jest.fn(),
  findRecentByStudentSubject: jest.fn(),
  getRiskCountsBySubject: jest.fn().mockResolvedValue(riskCounts),
  getAverageGradeBySubject: jest.fn().mockResolvedValue(15.5),
});

const mockAcademicClient = (): jest.Mocked<IAcademicServiceClient> => ({
  getGradesByStudent: jest.fn(),
  getEnrollmentsByStudent: jest.fn(),
  getEvaluationsBySubject: jest.fn(),
  getLatestCheckIn: jest.fn(),
  getSubjectOwnership: jest.fn().mockResolvedValue({ isOwner: true }),
  getSubjectDetails: jest.fn(),
  getStudentsByTeacher: jest.fn(),
});

describe('GetSubjectMetricsSummaryUseCase', () => {
  let metricsRepo: jest.Mocked<IStudentSubjectMetricsRepository>;
  let academicClient: jest.Mocked<IAcademicServiceClient>;
  let useCase: GetSubjectMetricsSummaryUseCase;

  beforeEach(() => {
    metricsRepo = mockMetricsRepo();
    academicClient = mockAcademicClient();
    useCase = new GetSubjectMetricsSummaryUseCase(metricsRepo, academicClient);
  });

  it('returns risk counts and average grade for the owning teacher', async () => {
    const result = await useCase.execute('subj-1', 'teacher-1', 'TEACHER');

    expect(academicClient.getSubjectOwnership).toHaveBeenCalledWith('teacher-1', 'subj-1');
    expect(result).toEqual({ ...riskCounts, averageGrade: 15.5 });
  });

  it('throws when the TEACHER caller does not own the subject', async () => {
    academicClient.getSubjectOwnership.mockResolvedValue({ isOwner: false });

    await expect(
      useCase.execute('subj-1', 'teacher-1', 'TEACHER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('skips the ownership check for ADMIN callers', async () => {
    const result = await useCase.execute('subj-1', 'admin-1', 'ADMIN');

    expect(academicClient.getSubjectOwnership).not.toHaveBeenCalled();
    expect(result).toEqual({ ...riskCounts, averageGrade: 15.5 });
  });

  it('returns null averageGrade when no metrics exist yet', async () => {
    metricsRepo.getAverageGradeBySubject.mockResolvedValue(null);

    const result = await useCase.execute('subj-1', 'admin-1', 'ADMIN');

    expect(result.averageGrade).toBeNull();
  });
});
