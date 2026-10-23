import { CalculateAverageUseCase } from '../calculate-average.use-case';
import { IAcademicServiceClient } from '../../../domain/ports/i-academic-service.client';
import { IStudentMetricsRepository } from '../../../domain/ports/i-student-metrics.repository';
import { IMetricsCachePort } from '../../../domain/ports/i-metrics-cache.port';
import { Grade } from '../../../domain/entities/grade.vo';

const grades: Grade[] = [
  { id: 'g1', studentId: 's1', subjectId: 'sub1', value: 8, periodId: 'p1', evaluationId: null },
  { id: 'g2', studentId: 's1', subjectId: 'sub2', value: 6, periodId: 'p1', evaluationId: null },
];

const mockAcademic = (): jest.Mocked<IAcademicServiceClient> => ({
  getGradesByStudent: jest.fn(),
  getEnrollmentsByStudent: jest.fn(),
  getEvaluationsBySubject: jest.fn(),
  getLatestCheckIn: jest.fn(),
  getAttendanceRate: jest.fn(),
  getSubjectOwnership: jest.fn(),
  getSubjectDetails: jest.fn(),
  getStudentsByTeacher: jest.fn(),
  getPeriodDetails: jest.fn(),
});

const mockMetricsRepo = (): jest.Mocked<IStudentMetricsRepository> => ({
  findByStudentAndPeriod: jest.fn(),
  findLatestByStudent: jest.fn(),
  findByPeriod: jest.fn(),
  findLatestPerStudent: jest.fn(),
  save: jest.fn(),
});

const mockCache = (): jest.Mocked<IMetricsCachePort> => ({
  get: jest.fn(),
  set: jest.fn(),
});

describe('CalculateAverageUseCase', () => {
  it('calculates global average (simple mean of subjects) and caches result', async () => {
    const academic = mockAcademic();
    const metricsRepo = mockMetricsRepo();
    const cache = mockCache();

    cache.get.mockResolvedValue(null);
    academic.getGradesByStudent.mockResolvedValue(grades);
    metricsRepo.findByStudentAndPeriod.mockResolvedValue(null);
    metricsRepo.save.mockImplementation(async (m) => m);

    const useCase = new CalculateAverageUseCase(academic, metricsRepo, cache);
    const result = await useCase.execute('s1', 'p1');

    expect(result.globalAverage).toBe(7);
    expect(result.subjectAverages.sub1).toBe(8);
    expect(cache.set).toHaveBeenCalledWith('metrics:s1:p1', expect.any(String), 300);
  });
});
