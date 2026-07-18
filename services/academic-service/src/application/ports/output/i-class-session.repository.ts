import { ClassSessionEntity } from '../../../domain/entities/class-session.entity';

export interface IClassSessionRepository {
  findById(id: string): Promise<ClassSessionEntity | null>;
  findBySubjectId(subjectId: string): Promise<ClassSessionEntity[]>;
  // Puede haber más de una sesión por semana si la materia tiene varias
  // franjas horarias (ej. lunes y miércoles).
  findBySubjectWeek(subjectId: string, academicWeek: number, academicYear: number): Promise<ClassSessionEntity[]>;
  saveMany(sessions: ClassSessionEntity[]): Promise<void>;
}
