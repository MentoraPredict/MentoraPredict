import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { WeeklyCheckInOrmEntity } from './weekly-check-in.orm-entity';
import { TopicOrmEntity } from './topic.orm-entity';

/**
 * Respuesta de comprensión por tema del sílabo — Fase C
 * (docs/database/database-update-plan.md §5.3). Reemplaza
 * weekly_check_ins.topic_responses (jsonb sin integridad referencial real).
 */
@Entity('weekly_check_in_topic_responses')
@Unique('UQ_weekly_check_in_topic_responses_checkin_topic', ['checkInId', 'topicId'])
@Check('CHK_weekly_check_in_topic_responses_comprehension', `"comprehension" BETWEEN 0 AND 100`)
export class WeeklyCheckInTopicResponseOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'check_in_id', type: 'uuid' }) checkInId!: string;
  @ManyToOne(() => WeeklyCheckInOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'check_in_id', foreignKeyConstraintName: 'FK_weekly_check_in_topic_responses_check_in_id' })
  checkIn?: WeeklyCheckInOrmEntity;

  @Column({ name: 'topic_id', type: 'uuid' }) topicId!: string;
  @ManyToOne(() => TopicOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'topic_id', foreignKeyConstraintName: 'FK_weekly_check_in_topic_responses_topic_id' })
  topic?: TopicOrmEntity;

  @Column() comprehension!: number;
}
