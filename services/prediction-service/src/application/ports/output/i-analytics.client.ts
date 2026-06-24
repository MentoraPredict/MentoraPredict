import { RiskSnapshot } from '../../../domain/entities/prediction-result.entity';

export interface IAnalyticsClient {
  getRiskSnapshot(studentId: string, periodId: string): Promise<RiskSnapshot>;
}
