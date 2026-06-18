import { Inject, Injectable } from "@nestjs/common";
import { IStudentMetricsRepository } from "../../domain/ports/i-student-metrics.repository";
import { IAcademicServiceClient } from "../../domain/ports/i-academic-service.client";
import { StudentMetricsEntity } from "../../domain/entities/student-metrics.entity";

export interface StudentRiskSummary {
  studentId: string;
  globalAverage: number;
  riskScore: number | null;
}

export interface TeacherDashboard {
  teacherId: string;
  periodId: string;
  totalStudents: number;
  students: StudentRiskSummary[];
  averageGroupScore: number;
  generatedAt: Date;
}

@Injectable()
export class GetTeacherDashboardUseCase {
  constructor(
    @Inject("IStudentMetricsRepository")
    private readonly metricsRepo: IStudentMetricsRepository,
    @Inject("IAcademicServiceClient")
    private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(
    teacherId: string,
    periodId: string,
    correlationId?: string,
  ): Promise<TeacherDashboard> {
    // Obtiene todos los estudiantes del período vía academic-service
    const enrollments = await this.academic.getEnrollmentsByStudent(
      teacherId,
      correlationId,
    );

    // Deduplica studentIds
    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    // Carga métricas de cada estudiante en paralelo
    const metricsResults = await Promise.allSettled(
      studentIds.map((sid) =>
        this.metricsRepo.findByStudentAndPeriod(sid, periodId),
      ),
    );

    const students: StudentRiskSummary[] = studentIds.map((sid, i) => {
      const result = metricsResults[i];
      const metrics: StudentMetricsEntity | null =
        result.status === "fulfilled" ? result.value : null;
      return {
        studentId: sid,
        globalAverage: metrics?.globalAverage ?? 0,
        riskScore: null, // calculado en ClassifyRiskUseCase por separado
      };
    });

    const averageGroupScore =
      students.length > 0
        ? Math.round(
            (students.reduce((s, st) => s + st.globalAverage, 0) /
              students.length) *
              100,
          ) / 100
        : 0;

    return {
      teacherId,
      periodId,
      totalStudents: students.length,
      students,
      averageGroupScore,
      generatedAt: new Date(),
    };
  }
}
