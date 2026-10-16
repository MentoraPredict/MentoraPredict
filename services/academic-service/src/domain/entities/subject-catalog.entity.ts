export class SubjectCatalogEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public code: string,
    public credits: number,
    public readonly careerId: string | null,
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
