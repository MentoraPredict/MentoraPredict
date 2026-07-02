export interface IAnalyticsClientPort {
  triggerRecalculate(subjectId: string, periodId: string, studentIds: string[]): Promise<void>;
}
