export class SubjectEntity {
  constructor(
    public readonly id: string,
    // name/description/code/credits/careerId viven en subject_catalog desde
    // la Fase A del plan de actualización de la base de datos — quedan acá
    // como campos denormalizados de solo lectura, poblados por el
    // repositorio vía JOIN. Escribirlos requiere pasar por
    // ISubjectCatalogRepository (ver update-subject.use-case.ts), nunca
    // directamente sobre esta entidad.
    public name: string,
    public description: string,
    public code: string,
    public credits: number,
    public readonly careerId: string | null,
    public readonly academicPeriodId: string,
    public maxCapacity: number,
    public teacherId: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public imageUrl: string | null = null,
    public readonly subjectCatalogId: string = '',
    public sectionId: string | null = null,
    public weeklyHours: number | null = null,
  ) {}

  assignTeacher(teacherId: string): void {
    this.teacherId = teacherId;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  setImage(url: string): void {
    this.imageUrl = url;
    this.updatedAt = new Date();
  }

  clearImage(): void {
    this.imageUrl = null;
    this.updatedAt = new Date();
  }
}
