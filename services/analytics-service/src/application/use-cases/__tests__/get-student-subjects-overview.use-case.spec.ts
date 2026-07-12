import { GetStudentSubjectsOverviewUseCase } from '../get-student-subjects-overview.use-case';
import { IStudentSubjectMetricsRepository } from '../../../domain/ports/i-student-subject-metrics.repository';
import { IAlertRepository } from '../../../domain/ports/i-alert.repository';
import { IAcademicServiceClient } from '../../../domain/ports/i-academic-service.client';
import { StudentSubjectMetricsEntity } from '../../../domain/entities/student-subject-metrics.entity';
import { AlertEntity } from '../../../domain/entities/alert.entity';
import { Enrollment } from '../../../domain/entities/enrollment.vo';

const mockMetricsRepo = (): jest.Mocked<IStudentSubjectMetricsRepository> => ({
  upsert: jest.fn(),
  findLatestByStudentAndSubject: jest.fn(),
  findByStudentSubjectPaginated: jest.fn(),
  findRecentByStudentSubject: jest.fn(),
  getRiskCountsBySubject: jest.fn(),
  getAverageGradeBySubject: jest.fn(),
  getWeeklyProgressBySubject: jest.fn(),
});

const mockAlertRepo = (): jest.Mocked<IAlertRepository> => ({
  save: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByStudentId: jest.fn(),
  findActiveByStudentAndSubject: jest.fn(),
  findByStudentPaginated: jest.fn(),
  findBySubjectPaginated: jest.fn(),
});

const mockAcademicClient = (): jest.Mocked<IAcademicServiceClient> => ({
  getGradesByStudent: jest.fn(),
  getEnrollmentsByStudent: jest.fn(),
  getEvaluationsBySubject: jest.fn(),
  getLatestCheckIn: jest.fn(),
  getSubjectOwnership: jest.fn(),
  getSubjectDetails: jest.fn(),
  getStudentsByTeacher: jest.fn(),
});

function enrollment(subjectId: string, status = 'ACTIVE'): Enrollment {
  return {
    id: `enr-${subjectId}`,
    studentId: 's1',
    subjectId,
    subjectCredits: 3,
    periodId: 'period-1',
    status,
  };
}

function metric(
  subjectId: string,
  overrides: Partial<{
    academicWeek: number;
    academicYear: number;
    averageGrade: number | null;
    riskLevel: StudentSubjectMetricsEntity['riskLevel'];
    trendSlope: number | null;
  }> = {},
): StudentSubjectMetricsEntity {
  return new StudentSubjectMetricsEntity(
    `metric-${subjectId}-${overrides.academicWeek ?? 3}`,
    's1',
    subjectId,
    'period-1',
    overrides.academicWeek ?? 3,
    overrides.academicYear ?? 2026,
    overrides.averageGrade ?? 15,
    80,
    90,
    5,
    75,
    overrides.riskLevel ?? 'LOW',
    overrides.trendSlope ?? 0,
    new Date('2026-01-15T00:00:00.000Z'),
  );
}

function alert(subjectId: string | null): AlertEntity {
  return new AlertEntity(
    `alert-${Math.random()}`,
    's1',
    'RISK_ESCALATION',
    'msg',
    'ACTIVE',
    new Date(),
    {},
    subjectId,
  );
}

describe('GetStudentSubjectsOverviewUseCase', () => {
  let metricsRepo: jest.Mocked<IStudentSubjectMetricsRepository>;
  let alertRepo: jest.Mocked<IAlertRepository>;
  let academicClient: jest.Mocked<IAcademicServiceClient>;
  let useCase: GetStudentSubjectsOverviewUseCase;

  beforeEach(() => {
    metricsRepo = mockMetricsRepo();
    alertRepo = mockAlertRepo();
    academicClient = mockAcademicClient();
    useCase = new GetStudentSubjectsOverviewUseCase(
      metricsRepo,
      alertRepo,
      academicClient,
    );
  });

  it('returns an empty array when the student has no active enrollments', async () => {
    academicClient.getEnrollmentsByStudent.mockResolvedValue([
      enrollment('subj-1', 'WITHDRAWN'),
    ]);

    const result = await useCase.execute('s1');

    expect(result).toEqual([]);
    expect(metricsRepo.findRecentByStudentSubject).not.toHaveBeenCalled();
    expect(alertRepo.findByStudentPaginated).not.toHaveBeenCalled();
  });

  it('batches metrics, risk, progress, and alerts across every active subject in one pass', async () => {
    academicClient.getEnrollmentsByStudent.mockResolvedValue([
      enrollment('subj-1'),
      enrollment('subj-2'),
      enrollment('subj-3', 'WITHDRAWN'),
    ]);
    metricsRepo.findRecentByStudentSubject.mockImplementation(
      async (_studentId, subjectId) =>
        subjectId === 'subj-1'
          ? [
              metric('subj-1', { academicWeek: 4, averageGrade: 18, riskLevel: 'LOW', trendSlope: 0.5 }),
              metric('subj-1', { academicWeek: 3, averageGrade: 16 }),
            ]
          : [metric('subj-2', { academicWeek: 4, averageGrade: 9, riskLevel: 'HIGH', trendSlope: -1 })],
    );
    alertRepo.findByStudentPaginated.mockResolvedValue({
      items: [alert('subj-1'), alert('subj-2'), alert('subj-2'), alert(null)],
      total: 4,
    });

    const result = await useCase.execute('s1');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        subjectId: 'subj-1',
        averageGrade: 18,
        riskLevel: 'LOW',
        trendDirection: 'IMPROVING',
      }),
    );
    expect(result[0].recentProgress).toHaveLength(2);
    expect(result[0].alerts).toHaveLength(1);
    expect(result[1]).toEqual(
      expect.objectContaining({
        subjectId: 'subj-2',
        averageGrade: 9,
        riskLevel: 'HIGH',
        trendDirection: 'WORSENING',
      }),
    );
    // The alert with no subjectId (legacy manual alert) and subj-3's
    // (WITHDRAWN, excluded entirely) don't leak into subj-2's list.
    expect(result[1].alerts).toHaveLength(2);
  });

  it('caps how many alerts are returned per subject', async () => {
    academicClient.getEnrollmentsByStudent.mockResolvedValue([enrollment('subj-1')]);
    metricsRepo.findRecentByStudentSubject.mockResolvedValue([metric('subj-1')]);
    alertRepo.findByStudentPaginated.mockResolvedValue({
      items: Array.from({ length: 8 }, () => alert('subj-1')),
      total: 8,
    });

    const result = await useCase.execute('s1');

    expect(result[0].alerts.length).toBeLessThanOrEqual(5);
  });

  it('returns null fields and empty arrays for a subject with no metrics recorded yet', async () => {
    academicClient.getEnrollmentsByStudent.mockResolvedValue([enrollment('subj-1')]);
    metricsRepo.findRecentByStudentSubject.mockResolvedValue([]);
    alertRepo.findByStudentPaginated.mockResolvedValue({ items: [], total: 0 });

    const result = await useCase.execute('s1');

    expect(result).toEqual([
      {
        subjectId: 'subj-1',
        averageGrade: null,
        riskLevel: null,
        trendDirection: null,
        computedAt: null,
        recentProgress: [],
        alerts: [],
      },
    ]);
  });

  it('classifies a near-zero slope as STABLE rather than IMPROVING/WORSENING', async () => {
    academicClient.getEnrollmentsByStudent.mockResolvedValue([enrollment('subj-1')]);
    metricsRepo.findRecentByStudentSubject.mockResolvedValue([
      metric('subj-1', { trendSlope: 0.05 }),
    ]);
    alertRepo.findByStudentPaginated.mockResolvedValue({ items: [], total: 0 });

    const result = await useCase.execute('s1');

    expect(result[0].trendDirection).toBe('STABLE');
  });
});
