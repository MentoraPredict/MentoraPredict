export class GradeEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public value: number,
    public readonly registeredBy: string,
    public readonly registeredAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public evaluationId: string | null = null,
  ) {
    this.assertValidValue(value);
  }

  private assertValidValue(v: number): void {
    if (v < 0 || v > 10) {
      throw new Error(`Grade value must be between 0 and 10, received: ${v}`);
    }
  }

  update(newValue: number): void {
    this.assertValidValue(newValue);
    this.value = newValue;
    this.updatedAt = new Date();
  }
}
