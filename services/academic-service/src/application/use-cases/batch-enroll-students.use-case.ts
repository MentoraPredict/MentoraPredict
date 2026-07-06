import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';

export interface BatchEnrollResult {
  enrolled: string[];
  skipped: string[];
  failed: Array<{ studentId: string; reason: string }>;
}

@Injectable()
export class BatchEnrollStudentsUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IUserProfilePort')
    private readonly userProfilePort: IUserProfilePort,
  ) {}

  async execute(
    subjectId: string,
    teacherId: string,
    studentIds: string[],
  ): Promise<BatchEnrollResult> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
      subjectId,
      teacherId,
      subject.academicPeriodId,
    );
    if (!assignment) throw new ForbiddenException('No tienes acceso a este curso');

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException('No se puede matricular en un periodo inactivo');
    }

    // Fetch all profiles in parallel — avoids N+1
    const profiles = await Promise.all(
      studentIds.map((id) => this.userProfilePort.getProfile(id)),
    );

    const enrolled: string[] = [];
    const skipped: string[] = [];
    const failed: Array<{ studentId: string; reason: string }> = [];

    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      const profile = profiles[i];

      if (!profile) {
        failed.push({ studentId, reason: 'Student not found' });
        continue;
      }
      if (profile.role !== 'STUDENT') {
        failed.push({ studentId, reason: 'User is not a STUDENT' });
        continue;
      }
      if (profile.status !== 'ACTIVE') {
        failed.push({ studentId, reason: 'Student account is not active' });
        continue;
      }

      const now = new Date();
      const enrollment = new EnrollmentEntity(
        randomUUID(),
        studentId,
        subjectId,
        subject.academicPeriodId,
        'ACTIVE',
        now,
        now,
      );

      try {
        const result = await this.enrollmentRepo.saveWithCapacityCheck(
          enrollment,
          subject.maxCapacity,
        );
        if (result === 'enrolled') enrolled.push(studentId);
        else if (result === 'already_enrolled') skipped.push(studentId);
        else failed.push({ studentId, reason: 'Subject has no available capacity' });
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'Enrollment failed';
        failed.push({ studentId, reason });
      }
    }

    return { enrolled, skipped, failed };
  }
}
