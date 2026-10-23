import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('ai_usage_logs')
@Index('idx_ai_usage_logs_created', ['createdAt'])
export class AiUsageOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }) createdAt!: Date;

  @Column({ type: 'varchar', length: 60 }) model!: string;

  @Column({ type: 'varchar', length: 20 }) kind!: string;

  @Column({ type: 'boolean' }) success!: boolean;

  @Column({ name: 'prompt_tokens', type: 'int', default: 0 }) promptTokens!: number;

  @Column({ name: 'completion_tokens', type: 'int', default: 0 }) completionTokens!: number;

  @Column({ name: 'total_tokens', type: 'int', default: 0 }) totalTokens!: number;

  @Column({ name: 'duration_ms', type: 'int', default: 0 }) durationMs!: number;

  @Column({ type: 'varchar', length: 300, nullable: true }) error!: string | null;
}