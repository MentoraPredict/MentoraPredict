export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// Una franja horaria semanal de una materia (oferta) — una materia puede
// tener varias (ej. lunes y miércoles), y cambia semestre a semestre porque
// cada semestre es una oferta (subjects) distinta. Ver
// docs/database/database-update-plan.md §5.2.
export class ClassScheduleEntity {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public dayOfWeek: DayOfWeek,
    public startTime: string,
    public endTime: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
