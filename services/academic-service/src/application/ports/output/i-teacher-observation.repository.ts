import { TeacherObservationEntity } from '../../../domain/entities/teacher-observation.entity';

export interface ITeacherObservationRepository {
  save(observation: TeacherObservationEntity): Promise<TeacherObservationEntity>;
  findByStudentId(studentId: string): Promise<TeacherObservationEntity[]>;
}
