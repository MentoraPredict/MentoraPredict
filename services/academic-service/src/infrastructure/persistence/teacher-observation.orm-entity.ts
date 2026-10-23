import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { SubjectOrmEntity } from './subject.orm-entity';

@Entity('teacher_observations')
@Index('idx_teacher_observations_student_created', ['studentId', 'createdAt'])
@Check(
  'CHK_teacher_observations_type',
  `"type" IN ('ACADEMIC','BEHAVIORAL','ATTENDANCE','PERFORMANCE')`,
)
export class TeacherObservationOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;

  @Column({ name: 'teacher_id', type: 'uuid' }) teacherId!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;

  @Column({ type: 'varchar', length: 20 }) type!: string;

  @Column({ type: 'text' }) content!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }) createdAt!: Date;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_teacher_observations_student_id' })
  student?: UserReferenceOrmEntity;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'teacher_id', foreignKeyConstraintName: 'FK_teacher_observations_teacher_id' })
  teacher?: UserReferenceOrmEntity;

  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_teacher_observations_subject_id' })
  subject?: SubjectOrmEntity;
}
