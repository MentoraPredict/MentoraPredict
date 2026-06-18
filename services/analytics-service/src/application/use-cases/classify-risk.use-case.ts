import { Inject, Injectable } from "@nestjs/common";
import { RiskInputDto } from "../dtos/risk-input.dto";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

@Injectable()
export class ClassifyRiskUseCase {
  constructor(
    @Inject("RISK_HIGH_THRESHOLD") private readonly highThreshold: number,
    @Inject("RISK_CRITICAL_THRESHOLD")
    private readonly criticalThreshold: number,
  ) {}

  execute(input: RiskInputDto): { score: number; riskLevel: RiskLevel } {
    const score = this.computeScore(input);

    let riskLevel: RiskLevel;
    if (score < this.criticalThreshold) riskLevel = "CRITICAL";
    else if (score < this.highThreshold) riskLevel = "HIGH";
    else if (score < 60) riskLevel = "MEDIUM";
    else riskLevel = "LOW";

    return { score: Math.round(score * 100) / 100, riskLevel };
  }

  private computeScore(input: RiskInputDto): number {
    const avgComponent = (input.globalAverage / 10) * 100;
    const failedComponent = Math.max(0, 100 - input.failedEvaluations * 15);
    const trendComponent = Math.min(
      100,
      Math.max(0, 50 + input.trendSlope * 20),
    );
    const studyComponent = Math.min(100, input.studyHours * 10);

    return (
      avgComponent * 0.3 +
      input.complianceIndex * 0.25 +
      input.attendance * 0.2 +
      failedComponent * 0.15 +
      trendComponent * 0.05 +
      studyComponent * 0.05
    );
  }
}
