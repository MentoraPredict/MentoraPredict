import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Check, CreateDateColumn } from 'typeorm';
import { SubjectOrmEntity } from './subject.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity('grade_imports')
@Check('CHK_grade_imports_status', `"status" IN ('COMPLETED','COMPLETED_WITH_ERRORS','FAILED')`)
export class GradeImportOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_grade_imports_subject_id' })
  subject?: SubjectOrmEntity;

  @Column({ name: 'imported_by', type: 'uuid' }) importedBy!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'imported_by', foreignKeyConstraintName: 'FK_grade_imports_imported_by' })
  importedByUser?: UserReferenceOrmEntity;

  @Column({ name: 'file_name', length: 500 }) fileName!: string;

  @Column({ name: 'file_size', type: 'int' }) fileSize!: number;

  @Column({ name: 'total_rows', type: 'int', default: 0 }) totalRows!: number;

  @Column({ name: 'created_rows', type: 'int', default: 0 }) createdRows!: number;

  @Column({ name: 'updated_rows', type: 'int', default: 0 }) updatedRows!: number;

  @Column({ name: 'unchanged_rows', type: 'int', default: 0 }) unchangedRows!: number;

  @Column({ name: 'failed_rows', type: 'int', default: 0 }) failedRows!: number;

  @Column({ length: 30 }) status!: string;

  @Column({ type: 'jsonb', default: '[]' }) errors!: Record<string, unknown>[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
