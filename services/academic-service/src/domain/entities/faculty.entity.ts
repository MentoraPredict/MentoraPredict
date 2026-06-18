export class FacultyEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public description: string,
    public status: 'ACTIVE' | 'INACTIVE',
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = 'INACTIVE';
    this.updatedAt = new Date();
  }
}
