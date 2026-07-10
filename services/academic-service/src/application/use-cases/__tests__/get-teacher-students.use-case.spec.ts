import { GetTeacherStudentsUseCase } from '../get-teacher-students.use-case';
import { ISubjectTeacherRepository, TeacherSubjectRawRow } from '../../ports/output/i-subject-teacher.repository';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';

const mockSubjectTeacherRepo = (): jest.Mocked<ISubjectTeacherRepository> => ({
  findBySubjectTeacherAndPeriod: jest.fn(),
  save: jest.fn(),
  findByTeacherIdWithDetails: jest.fn(),
});

const mockEnrollmentRepo = (): jest.Mocked<IEnrollmentRepository> => ({
  findById: jest.fn(),
  findByStudentAndSubject: jest.fn(),
  findByStudentSubjectAndPeriod: jest.fn(),
  countActiveBySubject: jest.fn(),
  findByStudentId: jest.fn(),
  findBySubjectIdPaginated: jest.fn(),
  findByStudentIdWithDetails: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  saveWithCapacityCheck: jest.fn(),
});

const makeSubjectRow = (id: string): TeacherSubjectRawRow => ({
  id,
  name: 'Subject',
  code: 'S-1',
  description: '',
  credits: 4,
  maxCapacity: 30,
  isActive: true,
  careerId: 'career-1',
  careerName: 'Career',
  careerCode: 'C',
  facultyId: 'faculty-1',
  facultyName: 'Faculty',
  facultyCode: 'F',
  periodId: 'period-1',
  periodName: '2025-1',
  periodCode: '2025-1',
  periodStatus: 'ACTIVE',
  periodStartDate: new Date(),
  periodEndDate: new Date(),
  enrolledCount: 1,
});

const makeEnrollment = (studentId: string, subjectId: string) =>
  new EnrollmentEntity('enr-' + studentId + subjectId, studentId, subjectId, 'period-1', 'ACTIVE', new Date(), new Date());

describe('GetTeacherStudentsUseCase', () => {
  it('returns deduplicated student ids across all of the teacher\'s subjects', async () => {
    const subjectTeacherRepo = mockSubjectTeacherRepo();
    const enrollmentRepo = mockEnrollmentRepo();
    const useCase = new GetTeacherStudentsUseCase(subjectTeacherRepo, enrollmentRepo);

    subjectTeacherRepo.findByTeacherIdWithDetails.mockResolvedValue({
      items: [makeSubjectRow('subj-1'), makeSubjectRow('subj-2')],
      total: 2,
    });
    enrollmentRepo.findBySubjectIdPaginated.mockImplementation(async (subjectId: string) => {
      if (subjectId === 'subj-1') {
        return { items: [makeEnrollment('stud-1', 'subj-1'), makeEnrollment('stud-2', 'subj-1')], total: 2 };
      }
      return { items: [makeEnrollment('stud-2', 'subj-2'), makeEnrollment('stud-3', 'subj-2')], total: 2 };
    });

    const result = await useCase.execute('teacher-1', 'period-1');

    expect(result.sort()).toEqual(['stud-1', 'stud-2', 'stud-3']);
    expect(subjectTeacherRepo.findByTeacherIdWithDetails).toHaveBeenCalledWith(
      'teacher-1',
      { periodId: 'period-1' },
      { page: 1, limit: 500 },
    );
  });

  it('returns an empty array when the teacher has no subjects in the period', async () => {
    const subjectTeacherRepo = mockSubjectTeacherRepo();
    const enrollmentRepo = mockEnrollmentRepo();
    const useCase = new GetTeacherStudentsUseCase(subjectTeacherRepo, enrollmentRepo);

    subjectTeacherRepo.findByTeacherIdWithDetails.mockResolvedValue({ items: [], total: 0 });

    const result = await useCase.execute('teacher-1', 'period-1');

    expect(result).toEqual([]);
    expect(enrollmentRepo.findBySubjectIdPaginated).not.toHaveBeenCalled();
  });
});
