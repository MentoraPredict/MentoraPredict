import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { IGradeRepository } from '../ports/output/i-grade.repository';

@Injectable()
export class GetSubjectEnrollmentsUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IUserProfilePort')
    private readonly userProfilePort: IUserProfilePort,
    @Inject('IGradeRepository')
    private readonly gradeRepo: IGradeRepository,
  ) {}

  async execute(
    subjectId: string,
    requesterId: string,
    requesterRole: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Subject not found');

    if (requesterRole === 'TEACHER') {
      const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
        subjectId,
        requesterId,
        subject.academicPeriodId,
      );
      if (!assignment) {
        throw new ForbiddenException('No tienes acceso a este curso');
      }
    }

    const statusFilter = filters.status ?? 'ACTIVE';
    const { items, total } = await this.enrollmentRepo.findBySubjectIdPaginated(
      subjectId,
      { status: statusFilter },
      pagination,
    );

    const enriched = await Promise.all(
      items.map(async (e) => {
        const [profile, grade] = await Promise.all([
          this.userProfilePort.getProfile(e.studentId),
          this.gradeRepo.findByStudentAndSubject(e.studentId, subjectId),
        ]);
        return {
          enrollmentId: e.id,
          studentId: e.studentId,
          firstName: profile?.firstName ?? null,
          lastName: profile?.lastName ?? null,
          email: profile?.email ?? null,
          status: e.status,
          enrolledAt: e.enrolledAt,
          currentAverage: grade?.value ?? null,
        };
      }),
    );

    return { data: enriched, total, page: pagination.page, limit: pagination.limit };
  }
}
