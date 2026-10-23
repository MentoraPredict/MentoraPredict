import { ClassScheduleEntity } from '../../../domain/entities/class-schedule.entity';

export interface IClassScheduleRepository {
  findById(id: string): Promise<ClassScheduleEntity | null>;
  findBySubjectId(subjectId: string): Promise<ClassScheduleEntity[]>;
  saveMany(schedules: ClassScheduleEntity[]): Promise<ClassScheduleEntity[]>;
  deleteBySubjectId(subjectId: string): Promise<void>;
}
