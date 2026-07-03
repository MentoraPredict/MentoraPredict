export interface IPredictionClientPort {
  triggerRecalculate(studentId: string, subjectId: string, periodId: string): Promise<void>;
}
