import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity('dataset_versions')
@Index('idx_dataset_versions_student_type_timestamp', ['studentId', 'type', 'timestamp'])
export class DatasetVersionOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;

  @Column({ type: 'varchar', length: 50 }) type!: string;

  @Column({ type: 'jsonb' }) inputs!: Record<string, unknown>;

  @Column({ type: 'jsonb' }) result!: Record<string, unknown>;

  @Column({ type: 'timestamptz' }) timestamp!: Date;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_dataset_versions_student_id' })
  student?: UserReferenceOrmEntity;
}
