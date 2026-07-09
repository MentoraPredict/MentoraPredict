import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateEnrollmentStatusUseCase } from '../update-enrollment-status.use-case';
import { IEnrollmentRepository } from '../../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../../ports/output/i-subject-teacher.repository';
import { IUserProfilePort } from '../../ports/output/i-user-profile.port';
import { INotificationClientPort } from '../../ports/output/i-notification-client.port';
import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';
import { SubjectEntity } from '../../../domain/entities/subject.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

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

const mockSubjectRepo = (): jest.Mocked<ISubjectRepository> => ({
  findById: jest.fn(),
  findByAcademicPeriodId: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByNameAndPeriod: jest.fn(),
  hasAcademicRecords: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockPeriodRepo = (): jest.Mocked<IAcademicPeriodRepository> => ({
  findById: jest.fn(),
  findActive: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  countActive: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  hasRecords: jest.fn(),
  delete: jest.fn(),
});

const mockSubjectTeacherRepo = (): jest.Mocked<ISubjectTeacherRepository> => ({
  findBySubjectTeacherAndPeriod: jest.fn(),
  save: jest.fn(),
  findByTeacherIdWithDetails: jest.fn(),
});

const mockUserProfilePort = (): jest.Mocked<IUserProfilePort> => ({
  getProfile: jest.fn(),
});

const mockNotificationClient = (): jest.Mocked<INotificationClientPort> => ({
  notify: jest.fn().mockResolvedValue(undefined),
});

const makeEnrollment = (status: 'ACTIVE' | 'WITHDRAWN' = 'ACTIVE') =>
  new EnrollmentEntity('enr-1', 'stud-1', 'subj-1', 'period-1', status, new Date(), new Date());

const makeSubject = () =>
  new SubjectEntity('subj-1', 'Math', '', 'MAT101', 3, 'career-1', 'period-1', 30, 'teacher-1', true, new Date(), new Date());

const makePeriod = () =>
  new AcademicPeriodEntity('period-1', '2025-1', '2025-1', '', new Date(), new Date(), 'ACTIVE', 'SEMESTER', new Date(), new Date());

describe('UpdateEnrollmentStatusUseCase', () => {
  let enrollmentRepo: jest.Mocked<IEnrollmentRepository>;
  let subjectRepo: jest.Mocked<ISubjectRepository>;
  let periodRepo: jest.Mocked<IAcademicPeriodRepository>;
  let subjectTeacherRepo: jest.Mocked<ISubjectTeacherRepository>;
  let userProfilePort: jest.Mocked<IUserProfilePort>;
  let notificationClient: jest.Mocked<INotificationClientPort>;
  let useCase: UpdateEnrollmentStatusUseCase;

  beforeEach(() => {
    enrollmentRepo = mockEnrollmentRepo();
    subjectRepo = mockSubjectRepo();
    periodRepo = mockPeriodRepo();
    subjectTeacherRepo = mockSubjectTeacherRepo();
    userProfilePort = mockUserProfilePort();
    notificationClient = mockNotificationClient();
    useCase = new UpdateEnrollmentStatusUseCase(
      enrollmentRepo,
      subjectRepo,
      periodRepo,
      subjectTeacherRepo,
      userProfilePort,
      notificationClient,
    );
  });

  it('notifies the student when a teacher withdraws them from the course', async () => {
    enrollmentRepo.findById.mockResolvedValue(makeEnrollment('ACTIVE'));
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue({} as never);
    userProfilePort.getProfile.mockResolvedValue({
      id: 'teacher-1',
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      role: 'TEACHER',
      status: 'ACTIVE',
    });
    enrollmentRepo.update.mockImplementation(async (e) => e);

    await useCase.execute('enr-1', 'WITHDRAWN', 'teacher-1', 'TEACHER');

    expect(notificationClient.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'stud-1',
        recipientRole: 'STUDENT',
        type: 'ENROLLMENT_WITHDRAWN',
        message: expect.stringContaining('Grace Hopper'),
      }),
    );
  });

  it('does not notify when reactivating a withdrawn enrollment', async () => {
    enrollmentRepo.findById.mockResolvedValue(makeEnrollment('WITHDRAWN'));
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue({} as never);
    enrollmentRepo.update.mockImplementation(async (e) => e);

    await useCase.execute('enr-1', 'ACTIVE', 'teacher-1', 'TEACHER');

    expect(notificationClient.notify).not.toHaveBeenCalled();
  });

  it('does not notify when the status does not actually change', async () => {
    enrollmentRepo.findById.mockResolvedValue(makeEnrollment('WITHDRAWN'));
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue({} as never);
    enrollmentRepo.update.mockImplementation(async (e) => e);

    await useCase.execute('enr-1', 'WITHDRAWN', 'teacher-1', 'TEACHER');

    expect(notificationClient.notify).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when enrollment does not exist', async () => {
    enrollmentRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('enr-1', 'WITHDRAWN', 'teacher-1', 'TEACHER')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ConflictException when the period is not active', async () => {
    enrollmentRepo.findById.mockResolvedValue(makeEnrollment('ACTIVE'));
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(
      new AcademicPeriodEntity('period-1', '2025-1', '2025-1', '', new Date(), new Date(), 'PLANNED', 'SEMESTER', new Date(), new Date()),
    );
    await expect(useCase.execute('enr-1', 'WITHDRAWN', 'teacher-1', 'TEACHER')).rejects.toThrow(
      ConflictException,
    );
  });

  it('throws ForbiddenException when a teacher does not own the course', async () => {
    enrollmentRepo.findById.mockResolvedValue(makeEnrollment('ACTIVE'));
    subjectRepo.findById.mockResolvedValue(makeSubject());
    periodRepo.findById.mockResolvedValue(makePeriod());
    subjectTeacherRepo.findBySubjectTeacherAndPeriod.mockResolvedValue(null);
    await expect(useCase.execute('enr-1', 'WITHDRAWN', 'teacher-1', 'TEACHER')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
