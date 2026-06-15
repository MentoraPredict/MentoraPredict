import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IStudentMetricsRepository } from "../../domain/ports/i-student-metrics.repository";
import { IAlertRepository } from "../../domain/ports/i-alert.repository";
import { IAcademicServiceClient } from "../../domain/ports/i-academic-service.client";
import { StudentMetricsEntity } from "../../domain/entities/student-metrics.entity";
import { AlertEntity } from "../../domain/entities/alert.entity";

export interface StudentDashboard {
  studentId: string;
  periodId: string;
  metrics: StudentMetricsEntity | null;
  alerts: AlertEntity[];
  unreadAlertsCount: number;
  enrollmentsCount: number;
  generatedAt: Date;
}

@Injectable()
export class GetStudentDashboardUseCase {
  constructor(
    @Inject("IStudentMetricsRepository")
    private readonly metricsRepo: IStudentMetricsRepository,
    @Inject("IAlertRepository") private readonly alertRepo: IAlertRepository,
    @Inject("IAcademicServiceClient")
    private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(
    studentId: string,
    periodId: string,
    correlationId?: string,
  ): Promise<StudentDashboard> {
    const [metrics, alerts, enrollments] = await Promise.all([
      this.metricsRepo.findByStudentAndPeriod(studentId, periodId),
      this.alertRepo.findByStudentId(studentId),
      this.academic.getEnrollmentsByStudent(studentId, correlationId),
    ]);

    const unreadAlertsCount = alerts.filter(
      (a) => a.status === "UNREAD",
    ).length;

    return {
      studentId,
      periodId,
      metrics,
      alerts,
      unreadAlertsCount,
      enrollmentsCount: enrollments.length,
      generatedAt: new Date(),
    };
  }
}
