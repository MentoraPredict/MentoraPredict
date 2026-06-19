import { Inject, Injectable } from "@nestjs/common";
import { IStudentMetricsRepository } from "../../domain/ports/i-student-metrics.repository";
import { IAlertRepository } from "../../domain/ports/i-alert.repository";
import { StudentMetricsEntity } from "../../domain/entities/student-metrics.entity";

export interface RiskDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}

export interface AdminDashboard {
  periodId: string;
  totalStudentsWithMetrics: number;
  institutionalAverage: number;
  riskDistribution: RiskDistribution;
  totalUnreadAlerts: number;
  generatedAt: Date;
}

// Clasifica riesgo con los mismos umbrales que ClassifyRiskUseCase (default: high=40, critical=25)
function classifyByAverage(avg: number): keyof RiskDistribution {
  if (avg >= 7) return "LOW";
  if (avg >= 6) return "MEDIUM";
  if (avg >= 5) return "HIGH";
  return "CRITICAL";
}

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(
    @Inject("IStudentMetricsRepository")
    private readonly metricsRepo: IStudentMetricsRepository,
    @Inject("IAlertRepository") private readonly alertRepo: IAlertRepository,
  ) {}

  async execute(periodId: string): Promise<AdminDashboard> {
    const allMetrics: StudentMetricsEntity[] =
      await this.metricsRepo.findByPeriod(periodId);

    const institutionalAverage =
      allMetrics.length > 0
        ? Math.round(
            (allMetrics.reduce((s, m) => s + m.globalAverage, 0) /
              allMetrics.length) *
              100,
          ) / 100
        : 0;

    const riskDistribution: RiskDistribution = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    for (const m of allMetrics) {
      riskDistribution[classifyByAverage(m.globalAverage)] += 1;
    }

    // Suma de alertas UNREAD de todos los estudiantes del período
    const studentIds = [...new Set(allMetrics.map((m) => m.studentId))];
    const alertsResults = await Promise.allSettled(
      studentIds.map((sid) => this.alertRepo.findByStudentId(sid, true)),
    );
    const totalUnreadAlerts = alertsResults.reduce((sum, r) => {
      return sum + (r.status === "fulfilled" ? r.value.length : 0);
    }, 0);

    return {
      periodId,
      totalStudentsWithMetrics: allMetrics.length,
      institutionalAverage,
      riskDistribution,
      totalUnreadAlerts,
      generatedAt: new Date(),
    };
  }
}
