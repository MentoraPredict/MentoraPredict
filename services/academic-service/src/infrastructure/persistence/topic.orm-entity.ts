import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('topics')
@Index('idx_topic_subject_order', ['subjectId', 'order'])
export class TopicOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @Column({ length: 200 }) title!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'int' }) order!: number;

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true }) fileUrl!: string | null;
  @Column({ name: 'original_file_name', type: 'varchar', length: 255, nullable: true })
  originalFileName!: string | null;
  @Column({ name: 'file_size', type: 'int', nullable: true }) fileSize!: number | null;
  @Column({ name: 'mime_type', type: 'varchar', length: 150, nullable: true }) mimeType!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
