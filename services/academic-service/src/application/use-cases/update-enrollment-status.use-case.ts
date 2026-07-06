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

    enrollment.status = newStatus;
    return this.enrollmentRepo.update(enrollment);
  }
}
