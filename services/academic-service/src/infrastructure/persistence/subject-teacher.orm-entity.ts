import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SubjectOrmEntity } from './subject.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity('subject_teachers')
export class SubjectTeacherOrmEntity {
  @PrimaryColumn({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_subject_teachers_subject_id' })
  subject?: SubjectOrmEntity;
  @PrimaryColumn({ name: 'teacher_id', type: 'uuid' }) teacherId!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id', foreignKeyConstraintName: 'FK_subject_teachers_teacher_id' })
  teacher?: UserReferenceOrmEntity;
  @PrimaryColumn({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @ManyToOne(() => AcademicPeriodOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_subject_teachers_period_id' })
  period?: AcademicPeriodOrmEntity;
}
