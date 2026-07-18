import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Local mirror of academic-service's `academic_periods` table — see
 * docs/database/entity-relationship-diagram.md §3/§4.5. Populated by upsert
 * from AcademicHttpClient.getPeriodDetails(); best-effort cache, not a
 * synchronized replica.
 */
@Entity('prediction_period_references')
export class PeriodReferenceOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 20 }) status!: string;
  @Column({ name: 'synced_at', type: 'timestamptz' }) syncedAt!: Date;
}
