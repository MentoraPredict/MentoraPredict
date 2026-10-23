import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

/**
 * Registro de fecha/hora de acceso a la plataforma — Fase E
 * (docs/database/database-update-plan.md §5.5). FK directa a `users`
 * (mismo servicio, `users` es la fuente real acá, no una tabla de
 * referencia). `device_type` queda reservada, sin poblar en esta fase.
 */
@Entity('login_events')
@Check('CHK_login_events_login_method', `"login_method" IN ('LOCAL','MICROSOFT')`)
export class LoginEventOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_login_events_user_id' })
  user?: UserOrmEntity;

  @Column({ name: 'occurred_at', type: 'timestamptz' }) occurredAt!: Date;
  @Column({ name: 'login_method', type: 'varchar', length: 20 }) loginMethod!: string;
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true }) ipAddress!: string | null;
  @Column({ name: 'user_agent', type: 'text', nullable: true }) userAgent!: string | null;
  @Column({ name: 'device_type', type: 'varchar', length: 20, nullable: true }) deviceType!: string | null;
}
