export class EvaluationEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public weight: number,           // 0-100, sum per subject must = 100
    public readonly subjectId: string,
    public dueDate: Date | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    if (weight < 0 || weight > 100) {
      throw new Error(`Evaluation weight must be 0-100, received: ${weight}`);
    }
  }
}
