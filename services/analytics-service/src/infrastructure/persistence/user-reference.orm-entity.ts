import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Local mirror of auth-service's `users` table — see
 * docs/database/entity-relationship-diagram.md §3/§4.4. Populated by upsert
 * from UserHttpClient.getProfile(); best-effort cache, not a synchronized
 * replica.
 */
@Entity('analytics_user_references')
export class UserReferenceOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 20 }) role!: string;
  @Column({ name: 'is_active' }) isActive!: boolean;
  @Column({ name: 'synced_at', type: 'timestamptz' }) syncedAt!: Date;
}
