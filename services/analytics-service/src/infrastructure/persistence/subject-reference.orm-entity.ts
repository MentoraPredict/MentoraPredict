import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Local mirror of academic-service's `subjects` table — see
 * docs/database/entity-relationship-diagram.md §3/§4.4. Populated by upsert
 * from AcademicHttpClient.getSubjectDetails(); best-effort cache, not a
 * synchronized replica.
 */
@Entity('analytics_subject_references')
export class SubjectReferenceOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'is_active' }) isActive!: boolean;
  @Column({ name: 'synced_at', type: 'timestamptz' }) syncedAt!: Date;
}
