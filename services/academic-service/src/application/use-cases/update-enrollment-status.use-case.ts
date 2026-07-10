import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { INotificationClientPort } from '../ports/output/i-notification-client.port';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

@Injectable()
export class UpdateEnrollmentStatusUseCase {
  constructor(
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IUserProfilePort')
    private readonly userProfilePort: IUserProfilePort,
    @Inject('INotificationClientPort')
    private readonly notificationClient: INotificationClientPort,
  ) {}

  async execute(
    enrollmentId: string,
    newStatus: 'ACTIVE' | 'WITHDRAWN',
    requesterId: string,
    requesterRole: string,
  ): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const subject = await this.subjectRepo.findById(enrollment.subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException(
        'No se puede modificar una matrícula en un periodo inactivo',
      );
    }

    if (requesterRole === 'TEACHER') {
      const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
        subject.id,
        requesterId,
        subject.academicPeriodId,
      );
      if (!assignment) {
        throw new ForbiddenException('No tienes acceso a este curso');
      }
    }

    const previousStatus = enrollment.status;
    enrollment.status = newStatus;
    const updated = await this.enrollmentRepo.update(enrollment);

    if (newStatus === 'WITHDRAWN' && previousStatus !== 'WITHDRAWN') {
      const requesterProfile = await this.userProfilePort.getProfile(requesterId).catch(() => null);
      const requesterName = requesterProfile
        ? `${requesterProfile.firstName} ${requesterProfile.lastName}`.trim()
        : null;

      void this.notificationClient.notify({
        recipientId: enrollment.studentId,
        recipientRole: 'STUDENT',
        type: 'ENROLLMENT_WITHDRAWN',
        title: 'Retiro de curso',
        message: requesterName
          ? `${requesterName} te retiró del curso ${subject.name}.`
          : `Fuiste retirado del curso ${subject.name}.`,
      });
    }

    return updated;
  }
}
