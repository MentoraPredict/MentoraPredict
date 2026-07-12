import { CheckUserDeactivationEligibilityUseCase } from '../check-user-deactivation-eligibility.use-case';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { ISubjectTeacherRepository } from '../../ports/output/i-subject-teacher.repository';

const enrollmentRepo = () =>
  ({
    hasActiveEnrollmentInActiveCourse: jest.fn().mockResolvedValue(false),
  }) as unknown as jest.Mocked<IEnrollmentRepository>;

const subjectTeacherRepo = () =>
  ({
    hasActiveCourseAssignment: jest.fn().mockResolvedValue(false),
  }) as unknown as jest.Mocked<ISubjectTeacherRepository>;

describe('CheckUserDeactivationEligibilityUseCase', () => {
  it('blocks a teacher assigned to an active course', async () => {
    const enrollments = enrollmentRepo();
    const assignments = subjectTeacherRepo();
    assignments.hasActiveCourseAssignment.mockResolvedValue(true);
    const useCase = new CheckUserDeactivationEligibilityUseCase(enrollments, assignments);

    const result = await useCase.execute('teacher-1', 'TEACHER');

    expect(result.canDeactivate).toBe(false);
    expect(result.reason).toContain('curso activo');
  });

  it('blocks a student enrolled in an active course', async () => {
    const enrollments = enrollmentRepo();
    const assignments = subjectTeacherRepo();
    enrollments.hasActiveEnrollmentInActiveCourse.mockResolvedValue(true);
    const useCase = new CheckUserDeactivationEligibilityUseCase(enrollments, assignments);

    const result = await useCase.execute('student-1', 'STUDENT');

    expect(result.canDeactivate).toBe(false);
    expect(result.reason).toContain('matrícula activa');
  });

  it('allows deactivation when there are no active dependencies', async () => {
    const useCase = new CheckUserDeactivationEligibilityUseCase(
      enrollmentRepo(),
      subjectTeacherRepo(),
    );

    await expect(useCase.execute('student-1', 'STUDENT')).resolves.toEqual({
      canDeactivate: true,
    });
  });
});
