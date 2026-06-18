import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('alerts')
export class AlertOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ type: 'varchar' }) type!: string;
  @Column({ type: 'text' }) message!: string;
  @Column({ type: 'varchar', default: 'UNREAD' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, unknown>;
}
