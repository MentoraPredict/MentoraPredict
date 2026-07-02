import { Inject, Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { IAnalyticsClientPort } from '../ports/output/i-analytics-client.port';

@Injectable()
export class GetStudentSubjectsUseCase {
  constructor(
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject('IUserProfilePort')
    private readonly userProfilePort: IUserProfilePort,
    @Inject('IAnalyticsClientPort')
    private readonly analyticsClient: IAnalyticsClientPort,
  ) {}

  async execute(
    studentId: string,
    filters: { periodId?: string; status?: string },
    pagination: { page: number; limit: number },
  ) {
    const statusFilter = filters.status ?? 'ACTIVE';
    const { items, total } = await this.enrollmentRepo.findByStudentIdWithDetails(
      studentId,
      { periodId: filters.periodId, status: statusFilter },
      pagination,
    );

    // Deduplicated teacher ID fetch — one call per unique teacher, not per row
    const uniqueTeacherIds = [
      ...new Set(items.map((r) => r.teacherId).filter((id): id is string => !!id)),
    ];

    const [teacherProfiles, metrics] = await Promise.all([
      Promise.all(uniqueTeacherIds.map((id) => this.userProfilePort.getProfile(id))),
      Promise.all(
        items.map((r) => this.analyticsClient.getLatestSubjectMetric(studentId, r.subjectId)),
      ),
    ]);

    const teacherMap = new Map(
      uniqueTeacherIds.map((id, i) => [id, teacherProfiles[i]]),
    );

    const data = items.map((row, i) => {
      const teacher = row.teacherId ? teacherMap.get(row.teacherId) : null;
      const metric = metrics[i];
      return {
        enrollmentId: row.enrollmentId,
        subjectId: row.subjectId,
        name: row.subjectName,
        code: row.subjectCode,
        description: row.subjectDescription,
        credits: row.credits,
        maxCapacity: row.maxCapacity,
        teacherId: row.teacherId,
        teacherName: teacher
          ? `${teacher.firstName} ${teacher.lastName}`
          : null,
        periodId: row.periodId,
        periodName: row.periodName,
        careerId: row.careerId,
        careerName: row.careerName,
        status: row.status,
        enrolledAt: row.enrolledAt,
        currentAverage: metric?.averageGrade ?? null,
        riskLevel: metric?.riskLevel ?? null,
      };
    });

    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}
