export class FacultyEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public description: string,
    public readonly createdAt: Date,
  ) {}
}
