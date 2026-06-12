import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('subject_teachers')
export class SubjectTeacherOrmEntity {
  @PrimaryColumn({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @PrimaryColumn({ name: 'teacher_id', type: 'uuid' }) teacherId!: string;
  @PrimaryColumn({ name: 'period_id', type: 'uuid' }) periodId!: string;
}
