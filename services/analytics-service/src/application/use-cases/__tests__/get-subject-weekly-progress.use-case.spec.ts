import { ForbiddenException } from '@nestjs/common';
import { GetSubjectWeeklyProgressUseCase } from '../get-subject-weekly-progress.use-case';
import { IStudentSubjectMetricsRepository } from '../../../domain/ports/i-student-subject-metrics.repository';
import { IAcademicServiceClient } from '../../../domain/ports/i-academic-service.client';

const progress = [
  { academicYear: 2026, academicWeek: 1, averageGrade: 14.5 },
  { academicYear: 2026, academicWeek: 2, averageGrade: 16 },
];

const mockMetricsRepo = (): jest.Mocked<IStudentSubjectMetricsRepository> => ({
  upsert: jest.fn(),
  findLatestByStudentAndSubject: jest.fn(),
  findByStudentSubjectPaginated: jest.fn(),
  findRecentByStudentSubject: jest.fn(),
  getRiskCountsBySubject: jest.fn(),
  getAverageGradeBySubject: jest.fn(),
  getWeeklyProgressBySubject: jest.fn().mockResolvedValue(progress),
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

describe('GetSubjectWeeklyProgressUseCase', () => {
  it('returns weekly course averages for the owning teacher', async () => {
    const metricsRepo = mockMetricsRepo();
    const academicClient = mockAcademicClient();
    const useCase = new GetSubjectWeeklyProgressUseCase(metricsRepo, academicClient);

    await expect(useCase.execute('subj-1', 'teacher-1', 'TEACHER')).resolves.toEqual(progress);
    expect(academicClient.getSubjectOwnership).toHaveBeenCalledWith('teacher-1', 'subj-1');
    expect(metricsRepo.getWeeklyProgressBySubject).toHaveBeenCalledWith('subj-1');
  });

  it('rejects a teacher who does not own the subject', async () => {
    const metricsRepo = mockMetricsRepo();
    const academicClient = mockAcademicClient();
    academicClient.getSubjectOwnership.mockResolvedValue({ isOwner: false });
    const useCase = new GetSubjectWeeklyProgressUseCase(metricsRepo, academicClient);

    await expect(useCase.execute('subj-1', 'teacher-2', 'TEACHER')).rejects.toThrow(
      ForbiddenException,
    );
    expect(metricsRepo.getWeeklyProgressBySubject).not.toHaveBeenCalled();
  });

  it('allows an administrator without checking ownership', async () => {
    const metricsRepo = mockMetricsRepo();
    const academicClient = mockAcademicClient();
    const useCase = new GetSubjectWeeklyProgressUseCase(metricsRepo, academicClient);

    await expect(useCase.execute('subj-1', 'admin-1', 'ADMIN')).resolves.toEqual(progress);
    expect(academicClient.getSubjectOwnership).not.toHaveBeenCalled();
  });
});
