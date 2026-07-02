import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('grade_imports')
export class GradeImportOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;

  @Column({ name: 'imported_by', type: 'uuid' }) importedBy!: string;

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
