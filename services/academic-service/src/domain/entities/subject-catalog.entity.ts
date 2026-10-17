export class SubjectCatalogEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public code: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public area: string | null = null,
  ) {}

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
