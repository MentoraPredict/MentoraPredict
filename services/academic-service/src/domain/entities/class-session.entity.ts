export type ClassSessionStatus = 'PLANNED' | 'HELD' | 'CANCELLED';

// Ocurrencia concreta de una class_schedule en una fecha real del período —
// una materia con 2 franjas semanales (ej. lunes y miércoles) genera 2
// class_sessions por semana, una por franja.
export class ClassSessionEntity {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public readonly scheduleId: string,
    public readonly sessionDate: Date,
    public readonly academicWeek: number,
    public readonly academicYear: number,
    public status: ClassSessionStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
