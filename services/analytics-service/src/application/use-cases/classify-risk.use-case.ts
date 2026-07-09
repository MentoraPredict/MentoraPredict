import { Inject, Injectable } from "@nestjs/common";
import { RiskInputDto } from "../dtos/risk-input.dto";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const RISK_RANK: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

// Nota mínima de aprobación (escala 0-20) — mismo valor que PASSING_GRADE en
// get-risk-snapshot.use-case.ts y recalculate-student-metrics.use-case.ts.
const PASSING_GRADE = 14;
// Por debajo de este promedio, el estudiante está reprobando con holgura,
// no solo "por debajo del mínimo" — se trata como un piso más severo.
const SEVERELY_FAILING_GRADE = 10;

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

    riskLevel = this.applyFailingGradeFloor(input.globalAverage, riskLevel);

    return { score: Math.round(score * 100) / 100, riskLevel };
  }

  // El promedio académico solo pesa 30% del score compuesto, así que un
  // estudiante reprobado con buen cumplimiento/asistencia puede terminar
  // clasificado como riesgo LOW pese a estar reprobando la materia. Este
  // piso escala la clasificación (nunca la baja) cuando el promedio por sí
  // solo ya amerita más atención de la que el score compuesto reflejó.
  private applyFailingGradeFloor(globalAverage: number, riskLevel: RiskLevel): RiskLevel {
    let floor: RiskLevel | null = null;
    if (globalAverage < SEVERELY_FAILING_GRADE) floor = "HIGH";
    else if (globalAverage < PASSING_GRADE) floor = "MEDIUM";

    if (floor && RISK_RANK[floor] > RISK_RANK[riskLevel]) {
      return floor;
    }
    return riskLevel;
  }

  private computeScore(input: RiskInputDto): number {
    const avgComponent = (input.globalAverage / 20) * 100;
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
