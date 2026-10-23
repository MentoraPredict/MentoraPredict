import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Local mirror of auth-service's `users` table — only the fields this
 * service's own logic actually branches on (role, is_active), not
 * presentation data (name/email, still fetched live via IUserProfilePort).
 * Populated by upsert from UserProfileAdapter.getProfile(); best-effort
 * cache, not a synchronized replica — see docs/database/entity-relationship-diagram.md §3.
 */
@Entity('academic_user_references')
export class UserReferenceOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 20 }) role!: string;
  @Column({ name: 'is_active' }) isActive!: boolean;
  @Column({ name: 'synced_at', type: 'timestamptz' }) syncedAt!: Date;
}
